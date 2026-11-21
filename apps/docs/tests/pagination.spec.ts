import { expect, test } from '@playwright/test';

test('switches flat rows from numbered pages to automatic loading and back', async ({ page }) => {
  await page.goto('docs/nuxt-ui/components/pagination');
  const demo = page.getByTestId('pagination-demo');
  const rows = demo.getByRole('rowgroup').last().getByRole('row');
  await expect(rows).toHaveCount(10);
  await demo.getByRole('button', { name: 'Next page' }).click();
  await expect(rows.first()).toContainText('Task 11');

  const selector = demo.getByRole('combobox', { name: 'Row loading mode' });
  await selector.click();
  await page.getByRole('option', { name: 'Infinite scroll' }).click();
  await expect(rows.first()).toContainText('Task 1');
  await expect(demo.getByRole('button', { name: 'Next page' })).toHaveCount(0);
  await demo.getByRole('button', { name: 'Load more' }).scrollIntoViewIfNeeded();
  await expect.poll(() => rows.count()).toBeGreaterThan(10);
  await expect(rows.nth(10)).toContainText('Task 11');

  await selector.click();
  await page.getByRole('option', { name: 'Pagination' }).click();
  await expect(rows).toHaveCount(10);
  await expect(rows.first()).toContainText('Task 1');
  expect(await demo.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
});
