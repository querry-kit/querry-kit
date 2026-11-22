import { expect, type Page } from '@playwright/test';
import type { DemoSession } from '@workboard/contracts';

/** Switches accounts through the navbar, using the same control as a keyboard user. */
export async function selectAccount(page: Page, login: DemoSession['login']): Promise<void> {
  const account = page.getByRole('combobox', { name: 'Switch demo account' });
  await account.press('Enter');
  await page.getByRole('option', { name: login, exact: true }).click();
  await expect(account).toContainText(login);
}
