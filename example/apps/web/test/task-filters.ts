import { type Locator, type Page } from '@playwright/test';

/** Opens the Tasks filter popover. */
export async function openTaskFilters(page: Page) {
  await page.getByRole('button', { name: 'Filter', exact: true }).click();
  return page.getByRole('dialog', { name: 'Filter', exact: true });
}

/** Adds the Project rule through the same field picker as other filters. */
export async function addProjectFilter(filters: Locator) {
  await filters.getByRole('combobox', { name: 'Select field' }).click();
  await filters.page().getByRole('option', { name: 'Project', exact: true }).click();
  await filters.getByRole('button', { name: 'Add filter', exact: true }).click();
  return filters.getByRole('button', { name: 'Project', exact: true });
}
