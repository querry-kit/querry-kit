import { createCaslAccessibleWhere } from '@querry-kit/nest/casl';
import type { BaseDelegate } from '@querry-kit/nest/dto';
import { QueryService } from '@querry-kit/nest/query-service';

import type { WorkboardAbility, WorkboardSubject } from '../auth/workboard-ability.js';

/** Translates the per-account CASL rules into Prisma `where` predicates. */
export const accessibleWhere = createCaslAccessibleWhere<WorkboardAbility, WorkboardSubject>();

/**
 * Creates a Query Kit service which composes the validated filter with CASL constraints.
 *
 * @see https://querry-kit.github.io/querry-kit/docs/nest/api/query-service/
 * @see https://querry-kit.github.io/querry-kit/docs/nest/api/casl/
 */
export function createScopedQuery(delegate: BaseDelegate, subject: WorkboardSubject) {
  return new QueryService(delegate, { subject, accessibleWhere, preserveJsonWhereTypes: true });
}
