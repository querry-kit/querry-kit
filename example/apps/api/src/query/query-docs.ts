import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtension,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiQuery,
  ApiUnauthorizedResponse,
  type SchemaObject,
} from '@nestjs/swagger';
import { apiErrorSchema } from '@workboard/contracts';
import { z } from 'zod';

/**
 * Publishes the same request and success schemas that runtime validation uses.
 *
 * @see https://querry-kit.github.io/querry-kit/docs/nest/api/openapi/
 * @see https://querry-kit.github.io/querry-kit/docs/nuxt/guide/controller-contract/
 */
export function describeRead(input: z.ZodType, output: z.ZodType): MethodDecorator {
  const inputSchema = z.toJSONSchema(input, { target: 'openapi-3.0', io: 'input' });
  const outputSchema = z.toJSONSchema(output, { target: 'openapi-3.0' });
  const error = z.toJSONSchema(apiErrorSchema, { target: 'openapi-3.0' });

  // Every operation accepts bracket keys; the JSON alternative makes `where` usable from Swagger UI.
  const parameters = Object.entries(inputSchema.properties ?? {}).map(
    /** Adds one documented query parameter from its shared input definition. */
    ([name, schema]) => {
      const acceptsJson = name === 'where' || name === 'orderBy';
      return ApiQuery({
        name,
        required: Array.isArray(inputSchema.required) && inputSchema.required.includes(name),
        schema: acceptsJson ? { type: 'string', example: '{}' } : (schema as SchemaObject),
        description: acceptsJson
          ? 'JSON or bracket notation; see x-normalized-query for the normalized shape.'
          : undefined,
        style: !acceptsJson && typeof schema === 'object' && schema?.type === 'object' ? 'deepObject' : 'form',
      });
    },
  );

  return applyDecorators(
    ...parameters,
    ApiExtension('x-normalized-query', inputSchema),
    ApiOkResponse({ schema: outputSchema as SchemaObject }),
    ApiBadRequestResponse({ schema: error as SchemaObject }),
    ApiUnauthorizedResponse({ schema: error as SchemaObject }),
    ApiForbiddenResponse({ schema: error as SchemaObject }),
  );
}
