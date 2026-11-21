import { expect, test } from '@playwright/test';

test('nested groups show complete counts and load records independently', async ({ page }, testInfo) => {
  const missingIcons: string[] = [];
  page.on('response', (response) => {
    if (response.url().includes('/api/_nuxt_icon/') && response.status() === 404) missingIcons.push(response.url());
  });
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
  const rows = branch.getByRole('rowgroup').last().getByRole('row');
  await expect(rows).toHaveCount(5);
  await expect(rows.first()).toHaveText('Task 43');
  await branch.getByRole('button', { name: 'Next page' }).click();
  await expect(rows.first()).toHaveText('Task 53');
  await demo.getByRole('combobox', { name: 'Row loading mode' }).click();
  await page.getByRole('option', { name: 'Infinite scroll' }).click();
  await expect(rows.first()).toHaveText('Task 43');
  await expect(rows).toHaveCount(5);
  await branch.getByRole('button', { name: 'Load more', exact: true }).click();
  await expect(rows).toHaveCount(8);
  await page.screenshot({ path: testInfo.outputPath('grouping.png'), fullPage: false });
  await done.click();
  await expect(bug).not.toBeVisible();
  await done.click();
  await expect(rows).toHaveCount(8);
  await demo.getByRole('button', { name: 'Refresh groups', exact: true }).click();
  await expect(done).toHaveAttribute('aria-expanded', 'false');
  await expect(demo.getByRole('button', { name: 'Open 42 items', exact: true })).toHaveCount(0);
  const overflow = await demo.evaluate((element) => element.scrollWidth > element.clientWidth + 1);
  expect(overflow).toBe(false);
  expect(missingIcons).toEqual([]);
});

test('grouping selection supports clearing and reordering', async ({ page }) => {
  await page.goto('docs/nuxt-ui/components/grouping');
  const demo = page.getByTestId('grouping-demo');
  await demo.getByRole('button', { name: 'Group by', exact: true }).click();
  const handle = page.getByRole('button', { name: 'Reorder Status', exact: true });
  await handle.press('ArrowDown');
  await expect(handle).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(demo.getByRole('button', { name: 'Bug 42 items', exact: true })).toBeVisible();
  await demo.getByRole('button', { name: 'Group by', exact: true }).click();
  await page.getByRole('button', { name: 'Clear grouping', exact: true }).click();
  await page.keyboard.press('Escape');
  const rows = demo.getByRole('table', { name: 'Demo tasks' }).getByRole('rowgroup').last().getByRole('row');
  await expect(rows).toHaveCount(5);
  await demo.getByRole('button', { name: 'Next page' }).click();
  await expect(rows.first()).toHaveText('Task 6');
});

test.describe('German table text overrides', () => {
  test.use({ locale: 'de-DE' });

  test('loads additional group rows with a localized keyboard action', async ({ page }) => {
    await page.goto('docs/nuxt-ui/components/grouping');
    const demo = page.getByTestId('grouping-demo');
    const selector = demo.getByRole('combobox', { name: 'Lademodus' });
    await selector.focus();
    await selector.press('Enter');
    await page.getByRole('option', { name: 'Endlos scrollen' }).click();
    await demo.getByRole('button', { name: 'Done 42 items' }).click();
    const leaf = demo.getByRole('button', { name: 'Bug 21 items' });
    await leaf.click();
    const section = leaf.locator('..');
    const rows = section.getByRole('rowgroup').last().getByRole('row');
    await expect(rows).toHaveCount(5);
    await section.getByRole('button', { name: 'Mehr laden' }).press('Enter');
    await expect(rows).toHaveCount(8);
  });
});

test('group totals table expands preloaded detail rows without more API calls', async ({ page }) => {
  await page.goto('docs/nuxt-ui/components/grouping');
  const demo = page.getByTestId('group-totals-demo');
  const summary = demo.getByRole('table', { name: 'Projects grouped by status' });
  const open = page.getByRole('button', { name: 'Projects: Open', exact: true });
  for (const [status, count, hours] of [
    ['Open', '26', '351'],
    ['Blocked', '1', '—'],
    ['Done', '1', '0'],
  ]) {
    const row = summary.getByRole('row').filter({ has: page.getByRole('button', { name: `Projects: ${status}` }) });
    await expect(row.getByRole('cell')).toHaveText([status, count, hours]);
  }
  await expect(demo).toHaveAttribute('data-api-requests', '3');

  const details = demo.getByRole('table', { name: 'Project details: Open' });
  const openRow = summary.getByRole('row').filter({ has: open });
  await expect(details).toHaveCount(0);
  await openRow.getByRole('cell', { name: '351', exact: true }).click();
  await expect(open).toHaveAttribute('aria-expanded', 'true');
  await expect(details.locator('tbody tr')).toHaveCount(26);
  await expect(details.getByRole('cell', { name: 'Open project 26', exact: true })).toBeVisible();
  await expect(details.getByText('Archived project', { exact: true })).toHaveCount(0);
  await openRow.press('Enter');
  await expect(details).toHaveCount(0);
  await open.click();
  await expect(details).toBeVisible();
  await open.click();
  await expect(details).toHaveCount(0);
  await expect(demo).toHaveAttribute('data-api-requests', '3');
  expect(await demo.evaluate((element) => element.scrollWidth > element.clientWidth + 1)).toBe(false);
});
