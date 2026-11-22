import type { Prisma } from '@/generated/prisma/client';
import type { BaseDelegateTypeMap } from '@querry-kit/nest';

export class ProjectTypeMap implements BaseDelegateTypeMap {
  select!: Prisma.ProjectSelect;
  include!: Prisma.ProjectInclude;
  whereInput!: Prisma.ProjectWhereInput;
  orderByWithRelationInput!: Prisma.ProjectOrderByWithRelationInput;
  whereUniqueInput!: Prisma.ProjectWhereUniqueInput;
  scalarFieldEnum!: Prisma.ProjectScalarFieldEnum;
  createInput!: Prisma.ProjectCreateInput;
  uncheckedCreateInput!: Prisma.ProjectUncheckedCreateInput;
  updateManyMutationInput!: Prisma.ProjectUpdateManyMutationInput;
  uncheckedUpdateManyInput!: Prisma.ProjectUncheckedUpdateManyInput;
  updateInput!: Prisma.ProjectUpdateInput;
  uncheckedUpdateInput!: Prisma.ProjectUncheckedUpdateInput;
  aggregateInputType!: Prisma.ProjectAggregateArgs;
}
