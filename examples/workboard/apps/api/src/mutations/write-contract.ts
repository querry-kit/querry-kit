import { applyDecorators, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
  type SchemaObject,
} from '@nestjs/swagger';
import { apiErrorSchema, resourceIdSchema, z } from '@workboard/contracts';

import { Prisma } from '../generated/prisma/client.js';

/** Parses a JSON payload or emits the Workboard error envelope. */
export function parseWrite<T extends z.ZodType>(schema: T, input: unknown): z.output<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new BadRequestException(
      issue?.path.length ? `Invalid ${issue.path.join('.')}.` : (issue?.message ?? 'Invalid body.'),
    );
  }
  return parsed.data;
}

/** Validates externally supplied resource IDs before passing them to Prisma. */
export function parseId(value: string): string {
  return parseWrite(resourceIdSchema, value);
}

/** Describes each write using its runtime contract, including bodyless deletes. */
export function describeWrite(status: 200 | 201 | 204, input?: z.ZodType, output?: z.ZodType): MethodDecorator {
  const error = { schema: z.toJSONSchema(apiErrorSchema, { target: 'openapi-3.0' }) as SchemaObject };
  const body = input
    ? [ApiBody({ schema: z.toJSONSchema(input, { target: 'openapi-3.0', io: 'input' }) as SchemaObject })]
    : [];
  const schema = output ? (z.toJSONSchema(output, { target: 'openapi-3.0' }) as SchemaObject) : undefined;
  return applyDecorators(
    ...body,
    ApiResponse({ status, schema }),
    ApiBadRequestResponse(error),
    ApiUnauthorizedResponse(error),
    ApiForbiddenResponse(error),
    ApiNotFoundResponse(error),
    ApiConflictResponse(error),
  );
}

/** Maps predictable database races and constraints to public responses. */
export function writeError(error: unknown, resource: 'Project' | 'Task', relationConflict: string): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') throw new NotFoundException(`${resource} not found.`);
    if (error.code === 'P2002' && resource === 'Project')
      throw new ConflictException('This project slug is already in use.');
    if (error.code === 'P2003') throw new ConflictException(relationConflict);
    if (error.code === 'P2034') throw new ConflictException('The data changed during the request. Try again.');
  }
  throw error;
}
