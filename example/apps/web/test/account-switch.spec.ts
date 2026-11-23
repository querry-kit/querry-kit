import { expect, test, type Page } from '@playwright/test';

import { selectAccount } from './demo-account';
import { openTaskFilters } from './task-filters';

test(
  'honors independent caller cancellation on resource reads',
  /** Exercises the same Nuxt-injected client the resource composables receive. */
  async ({ page }) => {
    await page.goto('/tasks');
    await expect(page.getByText('Audit default projections')).toBeVisible();
    const canceled = await page.evaluate(
      /** A pre-aborted signal must not be replaced by the current persona signal. */
      async () => {
        const root = document.querySelector('#__nuxt') as Element & {
          __vue_app__: {
            $nuxt: { $workboardApi: { get: (url: string, config: { signal: AbortSignal }) => Promise<unknown> } };
          };
        };
        try {
          await root.__vue_app__.$nuxt.$workboardApi.get('/tasks', { signal: AbortSignal.abort() });
          return false;
        } catch (cause) {
          return cause instanceof Error && 'code' in cause && cause.code === 'ERR_CANCELED';
        }
      },
    );
    expect(canceled).toBe(true);
  },
);

test(
  'keeps the persona until a write settles and refreshes a lost response before retry',
  /** Lets the API finish a PATCH, then drops only the browser response. */
  async ({ page }) => {
    await page.goto('/tasks');
    await page.getByRole('link', { name: 'Open Audit default projections' }).click();
    await page.getByRole('button', { name: 'Edit task' }).click();
    const received = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    await page.route(
      '**/api/tasks/*',
      /** Holds the actual resource write while keeping lookups available. */
      async (route) => {
        if (route.request().method() !== 'PATCH') return route.continue();
        const response = await route.fetch();
        expect(response.ok()).toBe(true);
        received.resolve();
        await release.promise;
        await route.abort('connectionreset');
      },
    );
    await page.getByRole('button', { name: 'Save changes' }).click();
    await received.promise;
    const picker = page.locator('[aria-label="Switch demo account"]');
    try {
      await expect(picker).toBeDisabled();
      await picker.dispatchEvent('click');
      await expect(page.getByRole('option', { name: 'user1' })).toHaveCount(0);
    } finally {
      release.resolve();
    }
    await expect(page.getByRole('alert')).toContainText('The write outcome is unknown');
    await page.getByRole('button', { name: 'Refresh current account' }).click();
    await expect(page.getByRole('heading', { name: 'Audit default projections' })).toBeVisible();
    await selectAccount(page, 'user1');
    await expect(page.getByText('Sketch an empty state')).toBeVisible();
    await expect(page.getByText('Audit default projections')).toHaveCount(0);
  },
);

/** Holds one real previous-account list response until after the account changes. */
async function holdRead(page: Page) {
  const captured = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  await page.route(
    '**/api/tasks?*',
    /** Retrieves the old payload before letting the test switch identities. */
    async (route) => {
      const response = await route.fetch();
      captured.resolve();
      await release.promise;
      await route.fulfill({ response }).catch(
        /** Cancellation of the old request is expected after a switch. */
        () => undefined,
      );
    },
    { times: 1 },
  );
  return { captured: captured.promise, release: release.resolve };
}

test(
  'drops previous-role and same-role list data when switching accounts',
  /** Works with real session cookies and scoped API responses. */
  async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('combobox', { name: 'Switch demo account' })).toContainText('admin');
    await expect(page.getByRole('columnheader', { name: 'Internal note' })).toBeVisible();
    await expect(page.getByText('Audit default projections')).toBeVisible();

    const fromAdmin = await holdRead(page);
    await page.getByRole('textbox', { name: 'Search tasks' }).fill('Audit');
    await fromAdmin.captured;
    await selectAccount(page, 'user1');
    fromAdmin.release();
    await expect(page.getByText('Sketch an empty state')).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Internal note' })).toHaveCount(0);
    await expect(page.getByText('Audit default projections')).toHaveCount(0);

    const fromUser1 = await holdRead(page);
    await page.getByRole('textbox', { name: 'Search tasks' }).fill('Sketch');
    await fromUser1.captured;
    await selectAccount(page, 'user2');
    fromUser1.release();
    await expect(page.getByText('Draft filter reference')).toBeVisible();
    await expect(page.getByText('Sketch an empty state')).toHaveCount(0);

    await page.getByRole('link', { name: 'Open Draft filter reference' }).click();
    await expect(page.getByRole('heading', { name: 'Draft filter reference' })).toBeVisible();
    await selectAccount(page, 'user1');
    await expect(page).toHaveURL(/\/tasks$/);
    await expect(page.getByText('Sketch an empty state')).toBeVisible();
    await expect(page.getByText('Draft filter reference')).toHaveCount(0);
  },
);

test(
  'defaults a new session to admin and restores a later navbar selection',
  /** Exercises the actual cookie flow and confirms direct entry keeps the requested page. */
  async ({ page }) => {
    await page.goto('/projects');
    const account = page.getByRole('combobox', { name: 'Switch demo account' });
    await expect(account).toContainText('admin');
    await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New project', exact: true })).toBeVisible();
    await selectAccount(page, 'user1');
    await page.goto('/projects');
    await expect(account).toContainText('user1');
    await expect(page.getByRole('link', { name: 'Design', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New project', exact: true })).toHaveCount(0);
  },
);

test(
  'retries a failed automatic sign-in without presenting an account picker',
  /** Fails only the first session creation request and keeps cookie verification real. */
  async ({ page }) => {
    let failed = false;
    await page.route(
      '**/api/demo/session',
      /** Lets the invalid-cookie check and all subsequent requests reach the API. */
      async (route) => {
        if (!failed && route.request().method() === 'POST') {
          failed = true;
          await route.fulfill({ status: 503, json: { statusCode: 503, message: 'Temporary failure.' } });
        } else {
          await route.continue();
        }
      },
    );
    await page.goto('/tasks?project=design');
    await expect(page.getByRole('alert').getByText('Demo session unavailable')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Choose a demo account' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Retry', exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Switch demo account' })).toContainText('admin');
    const filters = await openTaskFilters(page);
    await expect(filters.getByRole('button', { name: 'Project', exact: true })).toContainText('Design');
    await expect(page).toHaveURL(/\/tasks\?project=design$/);
  },
);
