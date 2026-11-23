import { QuerySchema } from '@querry-kit/nest/zod';
const page: number = QuerySchema.parse({ page: '2' }).page;
void page;
