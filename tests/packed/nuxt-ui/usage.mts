import { FilterFieldType, type SortingState } from '@querry-kit/nuxt-ui/types';
const field: 'number' = FilterFieldType.Number;
const sorting: SortingState = [{ id: 'name', desc: false }];
void [field, sorting];
