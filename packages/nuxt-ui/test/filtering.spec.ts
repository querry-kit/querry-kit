import { describe, expect, it } from 'vitest';
import { FilterFieldType, FilteringFieldOperator } from '../src/runtime/types/table';
import { createFilter } from '../src/runtime/utils/filtering';

describe('createFilter', () => {
  it('creates Query Kit-compatible defaults for every supported filter kind', () => {
    expect(createFilter({ value: 'active', label: 'Active', type: FilterFieldType.Boolean }).value).toBe(true);
    expect(createFilter({ value: 'age', label: 'Age', type: FilterFieldType.Number })).toMatchObject({
      operator: FilteringFieldOperator.Equals,
      value: 0,
    });
    expect(createFilter({ value: 'status', label: 'Status', type: FilterFieldType.Enum, values: [] })).toMatchObject({
      operator: FilteringFieldOperator.In,
      value: [],
    });
  });
});
