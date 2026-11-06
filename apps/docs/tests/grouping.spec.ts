import { expect, test } from '@playwright/test';

test('nested groups show complete counts and load records independently', async ({ page }, testInfo) => {
  await page.goto('docs/nuxt-ui/components/grouping');
  const demo = page.getByTestId('grouping-demo');
  const done = demo.getByRole('button', { name: 'Done 42 items', exact: true });
  await expect(done).toBeVisible();
  await expect(demo.getByRole('button', { name: 'Open 42 items', exact: true })).toHaveCount(0);
  await demo.getByRole('button', { name: 'Load more', exact: true }).click();
  await expect(demo.getByRole('button', { name: 'Open 42 items', exact: true })).toBeVisible();
  await done.focus();
  await page.keyboard.press('Enter');
  await expect(done).toHaveAttribute('aria-expanded', 'true');
  const bug = demo.getByRole('button', { name: 'Bug 21 items', exact: true });
  await bug.click();
  const branch = bug.locator('..');
  await expect(branch.getByRole('listitem')).toHaveCount(5);
  await branch.getByRole('button', { name: 'Load more', exact: true }).click();
  await expect(branch.getByRole('listitem')).toHaveCount(10);
  await page.screenshot({ path: testInfo.outputPath('grouping.png'), fullPage: false });
  await done.click();
  await expect(bug).not.toBeVisible();
  await done.click();
  await expect(branch.getByRole('listitem')).toHaveCount(10);
  await demo.getByRole('button', { name: 'Refresh groups', exact: true }).click();
  await expect(done).toHaveAttribute('aria-expanded', 'false');
  await expect(demo.getByRole('button', { name: 'Open 42 items', exact: true })).toHaveCount(0);
  const overflow = await demo.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
  expect(overflow).toBe(false);
});

test('grouping selection supports clearing and reordering', async ({ page }) => {
  await page.goto('docs/nuxt-ui/components/grouping');
  const demo = page.getByTestId('grouping-demo');
  await demo.getByRole('button', { name: 'Group by', exact: true }).click();
  await page.getByRole('button', { name: 'Move group down', exact: true }).first().click();
  await page.keyboard.press('Escape');
  await expect(demo.getByRole('button', { name: 'Bug 42 items', exact: true })).toBeVisible();
  await demo.getByRole('button', { name: 'Group by', exact: true }).click();
  await page.getByRole('button', { name: 'Clear grouping', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(demo.getByRole('listitem')).toHaveCount(5);
  await demo.getByRole('button', { name: 'Load more', exact: true }).click();
  await expect(demo.getByRole('listitem')).toHaveCount(10);
});
