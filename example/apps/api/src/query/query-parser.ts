import { BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import qs from 'qs';
import type { z } from 'zod';

const unsafeKey = /(?:^|[\[.])(?:__proto__|prototype|constructor)(?:$|[\].])/;

/**
 * Reads Querry Kit's bracket syntax from the Fastify request and validates the normalized input.
 *
 * Preserve opaque strings until a field schema chooses to coerce them. `useTable` sends filters and sorting as JSON.
 *
 * @see https://querry-kit.github.io/querry-kit/docs/nest/guide/main-bootstrap/
 * @see https://querry-kit.github.io/querry-kit/docs/nest/concepts/query-transform/
 */
export function readQuery<T extends z.ZodType>(request: FastifyRequest, schema: T): z.output<T> {
  const rawUrl = request.raw.url ?? '';
  const separator = rawUrl.indexOf('?');
  const raw = separator === -1 ? '' : rawUrl.slice(separator + 1);
  if (raw.length > 8_192) throw new BadRequestException('Query string is too long.');

  let query: qs.ParsedQs;
  try {
    for (const key of new URLSearchParams(raw).keys()) {
      if (unsafeKey.test(key)) throw new Error('Unsafe parameter key.');
    }
    query = qs.parse(raw, {
      depth: 12,
      strictDepth: true,
      allowPrototypes: false,
      parameterLimit: 150,
      arrayLimit: 100,
      throwOnLimitExceeded: true,
      plainObjects: true,
    });
    for (const key of ['where', 'orderBy']) {
      if (typeof query[key] === 'string') query[key] = JSON.parse(query[key]);
    }
  } catch {
    throw new BadRequestException('Malformed or unsupported query parameters.');
  }

  const validated = schema.safeParse(query);
  if (!validated.success) {
    const location = validated.error.issues[0]?.path.join('.') || 'query';
    throw new BadRequestException(`Invalid ${location}.`);
  }

  return validated.data;
}
