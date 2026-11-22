import { PageMetaDTO } from '../../src/pagination/page-meta.dto';
import { ResourceQuery } from '../../src/resource-query';
import { ProjectDTO, type ProjectModel } from './project.dto';

const owner = { id: 'member', name: 'Ada Lovelace', role: 'OWNER' };
const model: ProjectModel = {
  id: 'project',
  name: 'Spring launch',
  updatedAt: new Date('2026-11-22'),
  workspace: { id: 'workspace', name: 'Product studio', members: [owner] },
  tasks: [
    {
      id: 'brief',
      title: 'Refine product brief',
      status: 'DONE',
      assignee: owner,
      labels: [
        { id: 'p', name: 'Product', color: 'violet' },
        { id: 'a', name: 'API', color: 'cyan' },
      ],
    },
    { id: 'docs', title: 'Document API contract', status: 'DOING', labels: [], assignee: null },
  ],
};

describe('historical Workboard project graph', () => {
  const service = {
    query: jest.fn().mockResolvedValue({
      items: [model],
      pageMeta: new PageMetaDTO({ itemCount: 1, pageOptions: { page: 1, perPage: 10 } }),
    }),
    findById: jest.fn().mockResolvedValue(model),
  };

  it('projects the exact list envelope and omits private and unrequested model fields', async () => {
    const fields = 'items{id,name,workspace{name},tasks{title,status,labels{name}}},meta{page,itemCount,pageCount}';
    const result = await ResourceQuery.query({
      service,
      query: { fields },
      schema: ProjectDTO,
      map: ProjectDTO.fromModel,
    });
    expect(result).toEqual({
      items: [
        {
          id: 'project',
          name: 'Spring launch',
          workspace: { name: 'Product studio' },
          tasks: [
            { title: 'Refine product brief', status: 'DONE', labels: [{ name: 'Product' }, { name: 'API' }] },
            { title: 'Document API contract', status: 'DOING', labels: [] },
          ],
        },
      ],
      meta: { page: 1, itemCount: 1, pageCount: 1 },
    });
    expect(service.query.mock.calls[0]?.[0].include).toEqual({ workspace: true, tasks: { include: { labels: true } } });
  });

  it('maps member relations and serializes an unassigned task without an assignee', async () => {
    const result = await ResourceQuery.findById({
      service,
      id: 'project',
      query: { fields: 'workspace{members{name}},tasks{title,assignee{name}}' },
      schema: ProjectDTO,
      map: ProjectDTO.fromModel,
    });
    expect(JSON.parse(JSON.stringify(result))).toEqual({
      workspace: { members: [{ name: 'Ada Lovelace' }] },
      tasks: [
        { title: 'Refine product brief', assignee: { name: 'Ada Lovelace' } },
        { title: 'Document API contract' },
      ],
    });
  });
});
