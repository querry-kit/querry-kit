import { expect, test } from '@playwright/test';

const packagePages = [
  'docs/nest',
  'docs/nuxt',
  'docs/nuxt-ui',
  'docs/nuxt-ui/components/toolbar',
  'docs/nuxt-ui/components/sorting',
  'docs/nuxt-ui/components/filtering',
  'docs/nuxt-ui/components/options',
  'docs/nuxt-ui/components/pagination',
];

test('package navigation, sidebars and table demos are available', async ({ page }, testInfo) => {
  await page.goto('docs/nuxt-ui/components/toolbar');
  if (testInfo.project.name === 'desktop') {
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible();
    const packageNavigation = page.locator('header').getByRole('navigation', { name: 'Package documentation' });
    await expect(packageNavigation.getByRole('link', { name: 'Nuxt UI', exact: true })).toBeVisible();
    await expect(page.locator('aside').last().locator('[data-slot="indicator"]')).toBeVisible();
  }
  await expect(page.locator('header').getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/querry-kit');
  await expect(page.getByText('Live toolbar')).toBeVisible();
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Navigation' }).click();
    await expect(page.getByRole('dialog').getByRole('link', { name: 'Table Toolbar' })).toBeVisible();
    await page.keyboard.press('Escape');
  } else {
    const sidebarNavigation = page.getByRole('navigation', { name: '@querry-kit/nuxt-ui navigation' });
    const tableControls = sidebarNavigation.getByRole('button', { name: 'Table Controls' });
    await expect(sidebarNavigation.getByRole('link', { name: 'Table Toolbar' })).toBeVisible();
    await tableControls.click();
    await expect(sidebarNavigation.getByRole('link', { name: 'Table Toolbar' })).not.toBeVisible();
    await tableControls.click();
    await expect(sidebarNavigation.getByRole('link', { name: 'Table Toolbar' })).toBeVisible();
  }
  if (testInfo.project.name === 'desktop') {
    await page.locator('header').getByRole('navigation', { name: 'Package documentation' }).getByRole('link', { name: 'Nest', exact: true }).click();
    await expect(page).toHaveURL(/\/docs\/nest$/);
  } else {
    await page.locator('header [data-slot="toggle"]').click();
    const headerMenu = page.getByRole('dialog');
    await expect(headerMenu.getByRole('navigation', { name: 'Package documentation' }).getByRole('link', { name: 'Nuxt UI', exact: true })).toBeVisible();
    await headerMenu.getByRole('navigation', { name: 'Package documentation' }).getByRole('link', { name: 'Nest', exact: true }).click();
    await expect(page).toHaveURL(/\/docs\/nest$/);
  }
});

test('search opens with its keyboard shortcut', async ({ page }, testInfo) => {
  await page.goto('docs/nest');
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: 'Search' }).click();
  } else {
    await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    await page.waitForTimeout(100);
    await page.keyboard.press(process.platform === 'darwin' ? 'Meta+K' : 'Control+K');
  }
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('theme picker updates and resets the documentation theme', async ({ page }) => {
  await page.goto('docs/nest');
  await page.getByRole('button', { name: 'Theme settings' }).click();
  await expect(page.getByText('Primary', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'rose' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'olive' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'red' }).locator('[data-slot="color-chip"]')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.getByRole('button', { name: 'orange' }).locator('[data-slot="color-chip"]')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.getByRole('button', { name: 'zinc' }).locator('[data-slot="color-chip"]')).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(page.getByRole('button', { name: 'red' }).locator('[data-slot="color-chip"]')).toHaveAttribute('style', /--color-light:\s*var\(--color-red-500\)/);
  await page.getByRole('button', { name: 'dark' }).click();
  const themeIcon = page.getByRole('button', { name: 'Theme settings' }).locator('[data-slot="leadingIcon"]');
  const redChip = page.getByRole('button', { name: 'red' }).locator('[data-slot="color-chip"]');
  const [themeIconColor, redChipColor] = await Promise.all([
    themeIcon.evaluate((element) => getComputedStyle(element).color),
    redChip.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  expect(themeIconColor).toBe(redChipColor);
  await page.getByRole('button', { name: 'violet' }).click();
  await expect(page.getByRole('button', { name: 'violet' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'Reset theme' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset theme' }).click();
  await expect(page.getByRole('button', { name: 'red' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: 'zinc' })).toHaveAttribute('aria-pressed', 'true');
});

for (const path of packagePages) {
  test(`renders ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
  });
}
