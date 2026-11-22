import { expect, test, type Page } from '@playwright/test';

import { selectAccount } from './demo-account';
import { addProjectFilter, openTaskFilters } from './task-filters';

/** Opens the task list and switches to the regular demo account. */
async function openWorkboard(page: Page): Promise<void> {
  await page.goto('/');
  await selectAccount(page, 'user1');
  await expect(page.getByRole('table')).toBeVisible();
  await expect(page.getByText('Showing 1–6 of 6')).toBeVisible();
}

test(
  'sorts task columns by their server-side values from the header',
  /** Verifies alphabetic and numeric ordering across all matching records before pagination. */
  async ({ page }) => {
    await page.goto('/tasks');
    const table = page.getByRole('table');
    const owner = table.getByRole('columnheader', { name: 'Owner', exact: true });
    const rows = table.getByRole('rowgroup').last().getByRole('row');
    await owner.getByRole('button').press('Enter');
    await expect(owner).toHaveAttribute('aria-sort', 'ascending');
    await expect(rows.first().getByRole('cell', { name: 'Avery Lane', exact: true })).toBeVisible();
    await owner.getByRole('button').click();
    await expect(owner).toHaveAttribute('aria-sort', 'descending');
    await expect(rows.first().getByRole('cell', { name: 'Robin Patel', exact: true })).toBeVisible();

    const cost = table.getByRole('columnheader', { name: 'Internal cost', exact: true });
    await cost.getByRole('button').click();
    await cost.getByRole('button').click();
    await expect(cost).toHaveAttribute('aria-sort', 'descending');
    await expect(rows.first().getByRole('cell', { name: '98765 ¢', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Sort', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Sort', exact: true }).getByText('Internal cost')).toBeVisible();
  },
);

test(
  'counts tasks and configures the Projects table from its toolbar',
  /** Exercises server-side sorting and filtering plus the actual column controls. */
  async ({ page }) => {
    await page.goto('/projects');
    const rows = page.getByRole('table').locator('tbody tr');
    const headers = page
      .getByRole('columnheader')
      .filter({ hasNot: page.getByRole('checkbox', { name: 'Select visible projects' }) });
    await expect(rows).toHaveCount(4);

    const sort = page.getByRole('button', { name: 'Sort', exact: true });
    await sort.click();
    const sortDialog = page.getByRole('dialog', { name: 'Sort', exact: true });
    await sortDialog.getByRole('combobox', { name: 'Select field' }).click();
    await page.getByRole('option', { name: 'Number of tasks', exact: true }).click();
    await sortDialog.getByRole('button', { name: 'Add sort' }).click();
    await sortDialog.getByRole('button', { name: 'Toggle sort direction' }).click();
    await sort.click();
    await expect(rows.first().getByRole('link', { name: 'Workboard', exact: true })).toBeVisible();
    await expect(rows.first().getByRole('cell', { name: '8', exact: true })).toBeVisible();

    const filter = page.getByRole('button', { name: 'Filter', exact: true });
    await filter.click();
    const filterDialog = page.getByRole('dialog', { name: 'Filter', exact: true });
    await filterDialog.getByRole('combobox', { name: 'Select field' }).click();
    await page.getByRole('option', { name: 'Number of tasks', exact: true }).click();
    await filterDialog.getByRole('button', { name: 'Add filter' }).click();
    await filterDialog.getByRole('spinbutton', { name: 'Number of tasks' }).fill('4');
    await filter.click();
    await expect(rows).toHaveCount(1);
    await expect(rows.first().getByRole('link', { name: 'Operations', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Table options' }).click();
    await expect(page.getByRole('button', { name: 'Reset layout', exact: true })).toHaveCount(0);
    const countOption = page.getByRole('listitem').filter({ hasText: /^Number of tasks$/ });
    const slugOption = page.getByRole('listitem').filter({ hasText: /^Slug$/ });
    await countOption.locator('.drag-handle').dragTo(slugOption, { targetPosition: { x: 50, y: 3 } });
    await page.keyboard.press('Escape');
    await expect(headers).toHaveText(['Project', 'Number of tasks', 'Slug', 'Actions']);

    await page.reload();
    await expect(headers).toHaveText(['Project', 'Number of tasks', 'Slug', 'Actions']);

    await page.getByRole('button', { name: 'Table options' }).click();
    const reset = page.getByRole('button', { name: 'Reset layout', exact: true });
    await expect(reset).toHaveText('');
    await reset.click();
    await expect(reset).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(headers).toHaveText(['Project', 'Slug', 'Number of tasks', 'Actions']);
    await page.reload();
    await expect(headers).toHaveText(['Project', 'Slug', 'Number of tasks', 'Actions']);
  },
);

test(
  'opens only accessible projects and links to filtered tasks',
  /** Uses the scoped project list and follows a real project filter link. */
  async ({ page }) => {
    await openWorkboard(page);
    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Workboard', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Operations', exact: true })).toHaveCount(0);
    await page.getByRole('textbox', { name: 'Search projects' }).fill('design');
    const design = page.getByRole('link', { name: 'Design', exact: true });
    await expect(design).toBeVisible();
    await expect(page.getByText('Showing 1–1 of 1')).toBeVisible();
    await design.click();
    await expect(page).toHaveURL(/\/tasks\?project=design$/);
    await expect(page.getByRole('heading', { name: 'Tasks', exact: true })).toBeVisible();
    await expect(page.getByText('Showing 1–3 of 3')).toBeVisible();
    await page.goto('/?project=design');
    await expect(page).toHaveURL(/\/tasks\?project=design$/);
    const filters = await openTaskFilters(page);
    await expect(filters.getByRole('button', { name: 'Project', exact: true })).toContainText('Design');
  },
);

test(
  'switches row loading mode and groups the same filtered table',
  /** Exercises both modes and a failed append against the seeded API. */
  async ({ page }) => {
    await openWorkboard(page);
    await page.locator('footer').getByRole('combobox').click();
    await page.getByRole('option', { name: '2', exact: true }).click();
    const documentation = page.getByRole('navigation', { name: 'Documentation' });
    await expect(documentation.getByRole('link', { name: 'API reference' })).toHaveAttribute('href', '/docs');
    await expect(documentation.getByRole('link', { name: 'Querry Kit docs' })).toBeVisible();

    await page.route(
      '**/api/tasks?*',
      /** Fails the first append while preserving fixture responses for all other requests. */
      async (route) => {
        if (new URL(route.request().url()).searchParams.get('page') === '2') {
          await route.fulfill({ status: 503, json: { statusCode: 503, message: 'Temporary append failure.' } });
        } else {
          await route.fallback();
        }
      },
    );
    const modes = page.getByRole('group', { name: 'Row loading mode' });
    const pagination = modes.getByRole('button', { name: 'Pagination', exact: true });
    const infinite = modes.getByRole('button', { name: 'Infinite scroll', exact: true });
    await expect(pagination).toHaveAttribute('aria-pressed', 'true');
    await pagination.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Pagination');
    await infinite.press('Space');
    await expect(infinite).toHaveAttribute('aria-pressed', 'true');
    await expect(pagination).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByRole('button', { name: 'Next page' })).toHaveCount(0);
    const retry = page.getByRole('button', { name: 'Retry', exact: true });
    await expect(retry).toBeVisible();
    await expect(page.getByText('Showing 1–2 of 6')).toBeVisible();
    await page.unroute('**/api/tasks?*');
    await retry.click();
    await expect(page.getByText('Showing 1–6 of 6')).toBeVisible();
    await expect(page.getByRole('table').locator('tbody tr')).toHaveCount(6);
    await infinite.hover();
    await expect(page.getByRole('tooltip')).toHaveText('Infinite scroll');

    await pagination.press('Space');
    await expect(pagination).toBeFocused();
    await expect(pagination).toHaveAttribute('aria-pressed', 'true');
    await expect(infinite).toHaveAttribute('aria-pressed', 'false');
    await expect(page.getByText('Showing 1–2 of 6')).toBeVisible();
    const filters = await openTaskFilters(page);
    const project = await addProjectFilter(filters);
    await project.click();
    await page.getByRole('option', { name: 'Design', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Filter', exact: true }).click();
    await expect(page.getByText('Showing 1–2 of 3')).toBeVisible();
    const groupBy = page.getByRole('button', { name: 'Group by', exact: true });
    await expect(groupBy).not.toHaveClass(/(?:^|\s)text-primary(?:\s|$)/);
    await groupBy.click();
    await page.getByRole('combobox', { name: 'Select grouping field' }).click();
    await expect(page.getByRole('option', { name: 'Internal cost' })).toHaveCount(0);
    await page.getByRole('option', { name: 'Status', exact: true }).click();
    await page.getByRole('button', { name: 'Add grouping' }).click();
    await expect(groupBy).toHaveClass(/(?:^|\s)text-primary(?:\s|$)/);
    await page.keyboard.press('Escape');
    const open = page.getByRole('button', { name: 'OPEN 1 items', exact: true });
    await open.click();
    await expect(page.getByRole('link', { name: 'Open Sketch an empty state' })).toBeVisible();
    await groupBy.click();
    await page.getByRole('button', { name: 'Clear grouping' }).click();
    await expect(groupBy).not.toHaveClass(/(?:^|\s)text-primary(?:\s|$)/);
    await page.keyboard.press('Escape');
    await expect(page.getByText('Showing 1–2 of 3')).toBeVisible();
  },
);

test(
  'uses the read dashboard to page, sort, filter, configure columns, and open details',
  /** Uses the real Nuxt UI controls and the seeded database. */
  async ({ page }) => {
    await openWorkboard(page);
    await page.locator('footer').getByRole('combobox').click();
    await page.getByRole('option', { name: '2', exact: true }).click();
    await expect(page.getByRole('columnheader', { name: 'Internal note', exact: true })).toHaveCount(0);
    await expect(page.getByText('Review navigation labels', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(page.getByText('Showing 3–4 of 6')).toBeVisible();
    await expect(page.getByText('Check colour contrast', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Sort', exact: true }).click();
    const sort = page.getByRole('dialog', { name: 'Sort', exact: true });
    await sort.getByRole('combobox', { name: 'Select field' }).click();
    await page.getByRole('option', { name: 'Est. hours' }).click();
    await page.getByRole('button', { name: 'Add sort' }).click();
    await sort.getByRole('combobox', { name: 'Select field' }).click();
    await page.getByRole('option', { name: 'Title', exact: true }).click();
    await page.getByRole('button', { name: 'Add sort' }).click();
    await page.getByRole('button', { name: 'Sort', exact: true }).click();
    await expect(page.getByText('Measure card spacing', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Filter', exact: true }).click();
    const filter = page.getByRole('dialog', { name: 'Filter', exact: true });
    await filter.getByRole('combobox', { name: 'Select field' }).click();
    await page.getByRole('option', { name: 'Est. hours' }).click();
    await page.getByRole('button', { name: 'Add filter' }).click();
    await expect(page.getByText('No matching tasks')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await page.getByRole('button', { name: 'Filter', exact: true }).click();

    const filters = await openTaskFilters(page);
    const project = await addProjectFilter(filters);
    await project.click();
    await page.getByRole('option', { name: 'Design', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Filter', exact: true }).click();
    await expect(page).toHaveURL(/\?project=design$/);
    await expect(page.getByText('Showing 1–2 of 3')).toBeVisible();
    await page.reload();
    await openTaskFilters(page);
    await expect(project).toContainText('Design');
    await page.getByRole('button', { name: 'Filter', exact: true }).click();

    await page.getByRole('button', { name: 'Table options' }).click();
    await page
      .getByRole('listitem')
      .filter({ hasText: /^Priority$/ })
      .getByRole('switch', { name: 'Toggle column visibility' })
      .click();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('columnheader', { name: 'Priority', exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Table options' }).click();
    await page.getByRole('button', { name: 'Reset layout', exact: true }).press('Enter');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('columnheader', { name: 'Priority', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Actions for Review detail layout' }).click();
    await page.getByRole('menuitem', { name: 'Open', exact: true }).click();
    await expect(page).toHaveURL(/\/tasks\/[^?]+\?project=design$/);
    await expect(page.getByRole('heading', { name: 'Review detail layout' })).toBeVisible();
    await expect(page.getByText('Avery Lane', { exact: true }).first()).toBeVisible();
  },
);

test(
  'renders a recoverable error before loading the real list',
  /** Injects one HTTP failure to distinguish retry state from a real empty response. */
  async ({ page }) => {
    await page.route(
      '**/api/tasks?*',
      /** Fails one list request while leaving session and subsequent list requests real. */
      async (route) => {
        await route.fulfill({
          status: 503,
          json: { statusCode: 503, message: 'Temporary test failure.' },
        });
      },
      { times: 1 },
    );
    await page.goto('/');
    await expect(page.getByText('Could not load tasks')).toBeVisible();
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByText('Showing 1–10 of 18')).toBeVisible();
  },
);

test(
  'combines multiple projects with the standard filter operators and keeps their URL',
  /** Exercises a bookmarked project, inclusion/exclusion, and combined filtering on a narrow screen. */
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 850 });
    await page.goto('/tasks?project=design&view=demo');
    // The footer hides its range when space is limited; the filter still updates the result count.
    const range = page.locator('footer p[aria-live="polite"]');
    await expect(range).toHaveText('Showing 1–3 of 3');
    const filters = await openTaskFilters(page);
    const project = filters.getByRole('button', { name: 'Project', exact: true });
    await expect(project).toContainText('Design');
    await project.click();
    await expect(page.getByRole('option', { name: 'Documentation', exact: true })).toBeVisible();
    await page.getByPlaceholder('Search…', { exact: true }).fill('Workboard');
    await expect(page.getByRole('option', { name: 'Documentation', exact: true })).toHaveCount(0);
    await expect(page.getByRole('option', { name: 'Design', exact: true })).toHaveAttribute('aria-selected', 'true');
    await page.getByRole('option', { name: 'Workboard', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(project).toContainText('Design');
    await expect(project).toContainText('Workboard');
    await expect(page).toHaveURL(/project=design&project=shared/);
    await expect(range).toHaveText('Showing 1–10 of 11');

    await filters.getByRole('combobox', { name: 'Operator for Project', exact: true }).click();
    await page.getByRole('option', { name: '∉', exact: true }).click();
    await expect(page).toHaveURL(/projectOp=notIn/);
    await expect(range).toHaveText('Showing 1–7 of 7');

    await filters.getByRole('combobox', { name: 'Select field' }).click();
    await page.getByRole('option', { name: 'Status', exact: true }).click();
    await filters.getByRole('button', { name: 'Add filter', exact: true }).click();
    await filters.getByRole('button', { name: 'Status', exact: true }).click();
    await page.getByRole('option', { name: 'OPEN', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(range).toHaveText('Showing 1–1 of 1');
    await filters.getByRole('button', { name: 'Toggle filter mode', exact: true }).click();
    await expect(range).toHaveText('Showing 1–10 of 11');

    await page.reload();
    await openTaskFilters(page);
    await expect(project).toContainText('Design');
    await expect(project).toContainText('Workboard');
    await expect(range).toHaveText('Showing 1–10 of 11');

    await filters.getByRole('button', { name: 'Clear filters', exact: true }).click();
    await expect(page).toHaveURL(/\/tasks\?view=demo$/);
    await expect(project).toHaveCount(0);
    await expect(filters.getByRole('button', { name: 'Clear filters', exact: true })).toHaveCount(0);
    await expect(range).toHaveText('Showing 1–10 of 18');
  },
);
