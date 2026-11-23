import { BadRequestException, HttpException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { QueryService as CoreQueryService } from '../core/query.service.js';
import { PageMetaDTO } from '../pagination/page-meta.dto.js';
import { QueryService } from './query.service.js';

class TestDelegate {
  calls: unknown[] = [];
  data = [{ id: '1', name: 'Ada' }];
  fail?: Error;

  async create(args: unknown) {
    return args;
  }

  async findMany(args: unknown) {
    this.calls.push(['findMany', args]);
    if (this.fail) {
      throw this.fail;
    }
    return this.data;
  }

  async updateMany(args: unknown) {
    return args;
  }

  async update(args: unknown) {
    return args;
  }

  async upsert(args: unknown) {
    return args;
  }

  async deleteMany(args: unknown) {
    return args;
  }

  async delete(args: unknown) {
    return args;
  }

  async findFirst(args: unknown) {
    this.calls.push(['findFirst', args]);
    if (this.fail) {
      throw this.fail;
    }
    return this.data[0] ?? null;
  }

  async findUnique(args: unknown) {
    this.calls.push(['findUnique', args]);
    return this.data[0] ?? null;
  }

  async aggregate(args: unknown) {
    this.calls.push(['aggregate', args]);
    return { total: { toNumber: () => 7 } };
  }

  async count(args: unknown) {
    this.calls.push(['count', args]);
    if (this.fail) {
      throw this.fail;
    }
    return this.data.length;
  }
}

describe.each([QueryService, CoreQueryService])('QueryService %p', (QueryService) => {
  it.each([
    { distinct: 'category', total: 2, page: 2, expected: [] },
    { distinct: ['category', 'rank'], total: 3, page: 2, expected: [{ id: '4' }] },
    { distinct: ['category', 'rank'], total: 3, page: 9, expected: [] },
  ])('counts scoped distinct tuples before pagination: %j', async ({ distinct, total, page, expected }) => {
    const data = [
      ['1', 'A', 1, 'mine'],
      ['2', 'A', 1, 'mine'],
      ['3', 'A', 2, 'mine'],
      ['4', 'B', 1, 'mine'],
      ['5', 'C', 3, 'other'],
    ];
    const rows = data.map(([id, category, rank, org]) => ({ id, category, rank, org }));
    const delegate = new TestDelegate();
    const findMany = jest.spyOn(delegate, 'findMany').mockImplementation(async (raw) => {
      const args = raw as {
        where: unknown;
        distinct: string | string[];
        select: Record<string, boolean>;
        skip?: number;
        take?: number;
        cursor?: unknown;
        include?: unknown;
      };
      expect(args.where).toEqual({ AND: [{ org: 'mine' }, {}] });
      const keys = [args.distinct].flat() as Array<keyof (typeof rows)[number]>;
      const tuples = new Map(
        rows.filter((r) => r.org === 'mine').map((r) => [JSON.stringify(keys.map((k) => r[k])), r]),
      );
      if (args.take === undefined) {
        expect(args.select).toEqual(Object.fromEntries(keys.map((k) => [k, true])));
        expect(args.cursor).toBeUndefined();
        expect(args.include).toBeUndefined();
        return [...tuples.values()].map((r) => Object.fromEntries(keys.map((k) => [k, r[k]]))) as never;
      }
      expect(args.select).toEqual({ id: true });
      expect(args.cursor).toEqual({ id: 'start' });
      return [...tuples.values()].slice(args.skip, (args.skip ?? 0) + args.take).map(({ id }) => ({ id })) as never;
    });
    const service = new QueryService(delegate, { subject: 'Row', accessibleWhere: () => ({ org: 'mine' }) });
    const result = await service.query(
      { distinct, page, perPage: 2, select: { id: true }, cursor: { id: 'start' } } as never,
      {},
    );
    expect(findMany).toHaveBeenCalledTimes(2);
    expect(result.items).toEqual(expected);
    expect(result.pageMeta).toMatchObject({ itemCount: total, pageCount: Math.ceil(total / 2) });
  });

  it('keeps includes on the page query and uses ordinary count for an empty distinct list', async () => {
    const delegate = new TestDelegate();
    delegate.data = [];
    const service = new QueryService(delegate);
    const include = { owner: true };
    const distinct = await service.query({ distinct: ['name'], include } as never);
    expect(distinct.items).toEqual([]);
    expect(distinct.pageMeta.itemCount).toBe(0);
    expect(delegate.calls).toEqual([
      ['findMany', expect.objectContaining({ distinct: ['name'], select: { name: true }, include: undefined })],
      ['findMany', expect.objectContaining({ distinct: ['name'], include, select: undefined })],
    ]);
    delegate.calls = [];
    await service.query({ distinct: [], include } as never);
    expect(delegate.calls.map((call) => (call as [string, unknown])[0])).toEqual(['count', 'findMany']);
  });

  it('finds one record and parses query options', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);

    await expect(service.findOne({ where: { active: 'true' }, orderBy: { name: 'asc' } } as never)).resolves.toEqual({
      id: '1',
      name: 'Ada',
    });
    expect(delegate.calls.at(-1)).toEqual([
      'findFirst',
      {
        select: undefined,
        include: undefined,
        where: { active: true },
        orderBy: { name: 'asc' },
        cursor: undefined,
        distinct: undefined,
      },
    ]);
  });

  it('finds many records and passes pagination args', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);

    await expect(service.findMany({ take: 1, skip: 0 } as never)).resolves.toEqual([{ id: '1', name: 'Ada' }]);
    expect(delegate.calls.at(-1)).toEqual([
      'findMany',
      {
        select: undefined,
        include: undefined,
        where: {},
        orderBy: undefined,
        cursor: undefined,
        take: 1,
        skip: 0,
        distinct: undefined,
      },
    ]);
  });

  it('finds by id and unique records', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);

    await expect(service.findById('1')).resolves.toEqual({ id: '1', name: 'Ada' });
    await expect(service.findUnique({ where: { id: '1' } } as never)).resolves.toEqual({ id: '1', name: 'Ada' });
  });

  it('uses findFirst for findUnique when ability is provided', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate, {
      subject: 'Book',
      accessibleWhere: () => ({ organizationId: 'org' }),
    });

    await service.findUnique({ where: { id: '1' } } as never, { can: true });

    expect(delegate.calls.at(-1)).toEqual([
      'findFirst',
      {
        where: { AND: [{ organizationId: 'org' }, { id: 1 }] },
        select: undefined,
        include: undefined,
      },
    ]);
  });

  it('aggregates, counts and queries paginated records', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);

    await expect(service.aggregate({ where: { active: 'true' }, _sum: { value: true } } as never)).resolves.toEqual({
      total: 7,
    });
    await expect(service.count({ where: { active: 'true' } } as never)).resolves.toBe(1);

    const result = await service.query({ page: 3, perPage: 10, where: { active: 'true' } } as never);

    expect(result.items).toEqual([{ id: '1', name: 'Ada' }]);
    expect(result.pageMeta.page).toBe(3);
    expect(result.pageMeta.itemCount).toBe(1);
    expect(delegate.calls.at(-1)).toEqual([
      'findMany',
      expect.objectContaining({ skip: 20, take: 10, where: { active: true } }),
    ]);
  });

  it('scopes aggregates and preserves validated scalar filter types', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate, {
      subject: 'Book',
      accessibleWhere: () => ({ organizationId: 'org' }),
      preserveJsonWhereTypes: true,
    });

    await service.aggregate({ where: { id: '001' }, _count: true } as never, { can: true });

    expect(delegate.calls.at(-1)).toEqual([
      'aggregate',
      { where: { AND: [{ organizationId: 'org' }, { id: '001' }] }, _count: true },
    ]);
  });

  it('rejects aggregates when the access resolver denies the subject', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate, {
      subject: 'Book',
      accessibleWhere: () => {
        throw Object.assign(new Error('denied'), { name: 'ForbiddenError' });
      },
    });

    await expect(service.aggregate({ _count: true } as never, {})).rejects.toThrow('Insufficient permissions.');
    expect(delegate.calls).toEqual([]);
  });

  it('uses default pagination when query page options are omitted', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);

    const result = await service.query({ where: { active: 'true' } } as never);

    expect(result.pageMeta.page).toBe(1);
    expect(result.pageMeta.perPage).toBe(10);
    expect(delegate.calls.at(-1)).toEqual([
      'findMany',
      expect.objectContaining({ skip: 0, take: 10, where: { active: true } }),
    ]);
  });

  it('merges access-control where clauses', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate, {
      subject: 'Book',
      accessibleWhere: () => ({ organizationId: 'org' }),
    });

    await service.findMany({ where: { active: 'true' } } as never, { can: true });

    expect(delegate.calls.at(-1)).toEqual([
      'findMany',
      expect.objectContaining({
        where: { AND: [{ organizationId: 'org' }, { active: true }] },
      }),
    ]);
  });

  it('does not merge access-control filters without resolver or subject', async () => {
    const delegateWithoutResolver = new TestDelegate();
    const serviceWithoutResolver = new QueryService(delegateWithoutResolver, { subject: 'Book' });

    await serviceWithoutResolver.findMany({ where: { active: 'true' } } as never, { can: true });

    expect(delegateWithoutResolver.calls.at(-1)).toEqual([
      'findMany',
      expect.objectContaining({
        where: { active: true },
      }),
    ]);

    const delegateWithoutSubject = new TestDelegate();
    const serviceWithoutSubject = new QueryService(delegateWithoutSubject, {
      accessibleWhere: () => ({ organizationId: 'org' }),
    });

    await serviceWithoutSubject.findMany({ where: { active: 'true' } } as never, { can: true });

    expect(delegateWithoutSubject.calls.at(-1)).toEqual([
      'findMany',
      expect.objectContaining({
        where: { active: true },
      }),
    ]);
  });

  it('throws not found errors for missing records', async () => {
    const delegate = new TestDelegate();
    delegate.data = [];
    const service = new QueryService(delegate);

    await expect(service.findById('missing')).rejects.toThrow(NotFoundException);
    await expect(service.findUnique({ where: { id: 'missing' } } as never)).rejects.toThrow(NotFoundException);
  });

  it('maps Prisma-like errors for findById', async () => {
    const delegate = new TestDelegate();
    const errorLogger = { error: jest.fn() };
    const service = new QueryService(delegate, { errorLogger });

    const validation = new Error('invalid');
    validation.name = 'PrismaClientValidationError';
    delegate.fail = validation;
    await expect(service.findById('1')).rejects.toThrow(BadRequestException);

    const known = Object.assign(new Error('head\n\n\nKnown data error'), { code: 'P2002', meta: { target: ['id'] } });
    delegate.fail = known;
    await expect(service.findById('1')).rejects.toThrow(BadRequestException);

    const knownWithoutNestedMessage = Object.assign(new Error('Known data error'), { code: 'P2003' });
    delegate.fail = knownWithoutNestedMessage;
    await expect(service.findById('1')).rejects.toThrow(BadRequestException);

    const httpError = new HttpException('custom', 418);
    delegate.fail = httpError;
    await expect(service.findById('1')).rejects.toBe(httpError);

    const unknown = new Error('unknown');
    delegate.fail = unknown;
    await expect(service.findById('1')).rejects.toThrow(InternalServerErrorException);
    expect(errorLogger.error).toHaveBeenCalledWith(unknown);
  });

  it('maps unknown errors without requiring an error logger', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);

    delegate.fail = new Error('unknown');

    await expect(service.findById('1')).rejects.toThrow(InternalServerErrorException);
  });

  it('maps delegate failures from find-one and find-many operations', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);
    delegate.fail = new Error('delegate failed');

    await expect(service.findOne({} as never)).rejects.toThrow(InternalServerErrorException);
    await expect(service.findMany()).rejects.toThrow(InternalServerErrorException);
  });

  it('maps forbidden-like query errors', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate, {
      subject: 'Book',
      accessibleWhere: () => {
        const error = new Error('forbidden');
        error.name = 'ForbiddenError';
        throw error;
      },
    });

    await expect(service.query({ page: 1, perPage: 10 } as never, {})).rejects.toThrow('Insufficient permissions');
  });

  it('maps ForbiddenErrorType query errors', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate, {
      subject: 'Book',
      accessibleWhere: () => {
        const error = new Error('forbidden');
        error.name = 'ForbiddenErrorType';
        throw error;
      },
    });

    await expect(service.query({ page: 1, perPage: 10 } as never, {})).rejects.toThrow('Insufficient permissions');
  });

  it('rethrows non-forbidden query errors', async () => {
    const delegate = new TestDelegate();
    const service = new QueryService(delegate);
    const error = new Error('count failed');
    delegate.fail = error;

    await expect(service.query({ page: 1, perPage: 10 } as never)).rejects.toBe(error);
  });
});

describe('legacy query service metadata', () => {
  it('retains decorated PageMetaDTO instances', async () => {
    const result = await new QueryService(new TestDelegate()).query({ page: 1, perPage: 10 });

    expect(result.pageMeta).toBeInstanceOf(PageMetaDTO);
  });
});
