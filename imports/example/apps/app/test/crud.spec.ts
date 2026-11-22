import { randomUUID } from 'node:crypto';

import { expect, test } from '@playwright/test';
import { projectLookupSchema, taskSchema } from '@workboard/contracts';

import { selectAccount } from './demo-account';

test(
  'deletes a selected DONE group by predicate and preserves another owner’s task',
  /** Verifies the request sent by the UI and the stored results using real demo sessions. */
  async ({ page }) => {
    await page.goto('/tasks?project=shared');
    await expect(page.getByRole('button', { name: 'New task', exact: true })).toBeVisible();
    const headers = { Origin: new URL(page.url()).origin };
    const title = `Group delete ${randomUUID()}`;
    const fixtures = [];
    for (const ownerLogin of ['user1', 'user1', 'user2']) {
      const response = await page.request.post('/api/tasks', {
        headers,
        data: { title, projectId: 'shared', status: 'DONE', priority: 'LOW', estimatedHours: 1, ownerLogin },
      });
      await expect(response).toBeOK();
      fixtures.push(taskSchema.parse(await response.json()));
    }
    await selectAccount(page, 'user1');
    await page.goto('/tasks?project=shared');
    await page.getByRole('textbox', { name: 'Search tasks' }).fill(title);
    const groupBy = page.getByRole('button', { name: 'Group by', exact: true });
    await groupBy.click();
    await page.getByRole('combobox', { name: 'Select grouping field' }).click();
    await page.getByRole('option', { name: 'Status', exact: true }).click();
    await page.getByRole('button', { name: 'Add grouping' }).click();
    await groupBy.click();
    await page.getByRole('checkbox', { name: 'Select group DONE 2 items', exact: true }).click();
    const selection = page.getByRole('toolbar', { name: 'Selection' });
    await expect(selection.getByRole('status')).toHaveText('2 selected');
    await selection.getByRole('button', { name: 'Delete selected', exact: true }).click();
    const request = page.waitForRequest(
      /** Captures the grouped deletion submitted by the confirmation dialog. */ (pending) =>
        pending.method() === 'POST' && new URL(pending.url()).pathname === '/api/tasks/bulk-delete',
    );
    const dialog = page.getByRole('dialog', { name: 'Delete selected tasks' });
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    const payload = (await request).postDataJSON();
    expect(payload).toMatchObject({ groups: [[{ field: 'status', value: 'DONE' }]], expectedCount: 2 });
    expect(payload.ids).toBeUndefined();
    await expect(page.getByText('No matching groups')).toBeVisible();
    await selectAccount(page, 'admin');
    for (const fixture of fixtures.slice(0, 2)) {
      expect((await page.request.get(`/api/tasks/${fixture.id}`)).status()).toBe(404);
    }
    const otherTask = `/api/tasks/${fixtures[2].id}`;
    await expect(await page.request.get(otherTask)).toBeOK();
    await expect(await page.request.delete(otherTask, { headers })).toBeOK();
  },
);

test(
  'bulk deletes empty projects and rolls back the selection if a project has tasks',
  /** Uses an isolated database and creates two empty projects for deletion. */
  async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: 'New project', exact: true })).toBeVisible();
    const headers = { Origin: new URL(page.url()).origin };
    const titles = ['A bulk project', 'B bulk project'];
    for (const title of titles) {
      await expect(
        await page.request.post('/api/projects', { headers, data: { title, slug: `bulk-${randomUUID()}` } }),
      ).toBeOK();
    }
    await page.reload();
    const first = page.getByRole('checkbox', { name: 'Select A bulk project', exact: true });
    const second = page.getByRole('checkbox', { name: 'Select B bulk project', exact: true });
    const occupied = page.getByRole('checkbox', { name: 'Select Design', exact: true });
    const header = page.getByRole('checkbox', { name: 'Select visible projects', exact: true });
    await first.click();
    await second.click();
    await occupied.click();
    await expect(header).toHaveAttribute('aria-checked', 'mixed');
    const selection = page.getByRole('toolbar', { name: 'Selection' });
    await expect(selection.getByRole('status')).toHaveText('3 selected');
    await selection.getByRole('button', { name: 'Delete selected', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Delete selected projects', exact: true });
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('Move or delete the tasks');
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(first).toBeChecked();
    await expect(second).toBeChecked();
    await occupied.click();
    await expect(selection.getByRole('status')).toHaveText('2 selected');
    await selection.getByRole('button', { name: 'Delete selected', exact: true }).click();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(first).toHaveCount(0);
    await expect(second).toHaveCount(0);
    await expect(occupied).toBeVisible();
  },
);

test(
  'confirms one bulk deletion for tasks selected across pages',
  /** Uses only disposable tasks created for this browser test. */
  async ({ page }) => {
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: 'New project', exact: true })).toBeVisible();
    const headers = { Origin: new URL(page.url()).origin };
    const slug = `bulk-${randomUUID()}`;
    const projectResponse = await page.request.post('/api/projects', { headers, data: { title: slug, slug } });
    await expect(projectResponse).toBeOK();
    const project = projectLookupSchema.parse(await projectResponse.json());
    const tasks = [];
    for (const title of ['A bulk task', 'B bulk task', 'C bulk task']) {
      const response = await page.request.post('/api/tasks', {
        headers,
        data: { title, projectId: project.id, status: 'OPEN', priority: 'NORMAL', estimatedHours: 1 },
      });
      await expect(response).toBeOK();
      tasks.push(taskSchema.parse(await response.json()));
    }

    await page.goto(`/tasks?project=${project.id}`);
    await page.locator('footer').getByRole('combobox').click();
    await page.getByRole('option', { name: '2', exact: true }).click();
    const table = page.getByRole('table');
    await table.getByRole('button', { name: 'Title', exact: true }).click();
    const selectPage = table.getByRole('checkbox', { name: 'Select visible tasks' });
    await table.getByRole('checkbox', { name: 'Select A bulk task' }).click();
    await expect(selectPage).toHaveAttribute('aria-checked', 'mixed');
    await page.getByRole('button', { name: 'Next page' }).click();
    await expect(table.getByRole('checkbox', { name: 'Select C bulk task' })).toBeVisible();
    await expect(selectPage).not.toBeChecked();
    await selectPage.click();
    await expect(selectPage).toBeChecked();
    const selection = page.getByRole('toolbar', { name: 'Selection' });
    await expect(selection.getByRole('status')).toHaveText('2 selected');
    const bulk = selection.getByRole('button', { name: 'Delete selected', exact: true });
    await bulk.click();
    const dialog = page.getByRole('dialog', { name: 'Delete selected tasks' });
    await expect(dialog.getByText('Permanently delete 2 selected tasks?')).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    await bulk.click();
    await dialog.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText('Showing 1–1 of 1')).toBeVisible();
    await expect(table.getByRole('link', { name: 'Open B bulk task' })).toBeVisible();
    await expect(bulk).toHaveCount(0);

    for (const task of [tasks[0], tasks[2]]) {
      expect((await page.request.get(`/api/tasks/${task.id}`)).status()).toBe(404);
    }
    const cleanup = await page.request.delete(`/api/tasks/${tasks[1].id}`, { headers });
    await expect(cleanup).toBeOK();
    await expect(await page.request.delete(`/api/projects/${project.id}`, { headers })).toBeOK();
  },
);

test(
  'creates, edits, and deletes a project and its task',
  /** Exercises real dialog submissions through Nuxt against a disposable Workboard database. */
  async ({ page }) => {
    const slug = `crud-ui-${randomUUID()}`;
    const project = `UI project ${slug}`;
    const updatedProject = `Updated ${project}`;
    const task = `Task for ${slug}`;
    const updatedTask = `Updated ${task}`;
    await page.goto('/projects');
    const newProject = page.getByRole('button', { name: 'New project', exact: true });
    await newProject.press('Enter');
    const createProject = page.getByRole('dialog', { name: 'New project', exact: true });
    await expect(createProject.getByLabel('Title')).toBeFocused();
    await createProject.getByLabel('Title').fill(project);
    await createProject.getByLabel('Slug').fill('Invalid slug');
    await createProject.getByRole('button', { name: 'Create project' }).click();
    await expect(createProject.getByText('Use lowercase letters, numbers, and single hyphens.')).toBeVisible();
    await createProject.getByLabel('Slug').fill(slug);
    await createProject.getByRole('button', { name: 'Create project' }).click();
    const projectRow = page.getByRole('row').filter({ has: page.getByRole('link', { name: project, exact: true }) });
    await expect(projectRow.getByRole('cell', { name: '0', exact: true })).toBeVisible();

    await page.getByRole('button', { name: `Actions for ${project}`, exact: true }).click();
    await page.getByRole('menuitem', { name: 'Edit', exact: true }).click();
    const editProject = page.getByRole('dialog', { name: 'Edit project', exact: true });
    await expect(editProject.getByLabel('Slug')).toHaveValue(slug);
    await editProject.getByLabel('Title').fill(updatedProject);
    await editProject.getByRole('button', { name: 'Save changes' }).click();
    await page.getByRole('link', { name: updatedProject, exact: true }).click();

    await page.getByRole('button', { name: 'New task', exact: true }).click();
    const createTask = page.getByRole('dialog', { name: 'New task', exact: true });
    await expect(createTask.getByRole('button', { name: 'Project', exact: true })).toContainText(updatedProject);
    await createTask.getByLabel('Title').fill(task);
    await createTask.getByLabel('Estimated hours').fill('3');
    await createTask.getByLabel('Internal note').fill('Synthetic note');
    await createTask.getByRole('button', { name: 'Create task', exact: true }).click();
    await expect(page.getByRole('heading', { name: task, exact: true })).toBeVisible();
    await expect(page.getByText('Synthetic note')).toBeVisible();
    const detail = page.url();

    await page.getByRole('button', { name: 'Edit task', exact: true }).click();
    const editTask = page.getByRole('dialog', { name: 'Edit task', exact: true });
    await expect(editTask.getByLabel('Estimated hours')).toHaveValue('3');
    await editTask.getByLabel('Title').fill(updatedTask);
    await editTask.getByRole('combobox', { name: /^Status/ }).click();
    await page.getByRole('option', { name: 'DONE', exact: true }).click();
    await editTask.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('heading', { name: updatedTask, exact: true })).toBeVisible();
    await expect(page.getByText('DONE / NORMAL')).toBeVisible();

    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    const updatedProjectRow = page
      .getByRole('row')
      .filter({ has: page.getByRole('link', { name: updatedProject, exact: true }) });
    await expect(updatedProjectRow.getByRole('cell', { name: '1', exact: true })).toBeVisible();
    const deleteProjectTrigger = page.getByRole('button', { name: `Actions for ${updatedProject}`, exact: true });
    await deleteProjectTrigger.click();
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
    const deleteProject = page.getByRole('dialog', { name: 'Delete project', exact: true });
    await deleteProject.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(deleteProject.getByRole('alert')).toContainText('Move or delete this project');
    await deleteProject.getByRole('button', { name: 'Cancel' }).click();
    await expect(deleteProjectTrigger).toBeFocused();

    await page.goto(detail);
    await page.getByRole('button', { name: 'Delete task', exact: true }).click();
    const deleteTask = page.getByRole('dialog', { name: 'Delete task', exact: true });
    await deleteTask.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByText('No matching tasks')).toBeVisible();

    await page.getByRole('link', { name: 'Projects', exact: true }).click();
    await expect(updatedProjectRow.getByRole('cell', { name: '0', exact: true })).toBeVisible();
    await deleteProjectTrigger.click();
    await page.getByRole('menuitem', { name: 'Delete', exact: true }).click();
    await deleteProject.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page.getByRole('link', { name: updatedProject, exact: true })).toHaveCount(0);
  },
);

test(
  'keeps project writes and internal fields out of the regular account UI',
  /** Checks the narrow-layout form and keyboard dismissal with a regular synthetic account. */
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 850 });
    await page.goto('/projects');
    await selectAccount(page, 'user1');
    await page.goto('/projects');
    await expect(page.getByRole('link', { name: 'Design', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New project', exact: true })).toHaveCount(0);
    await expect(page.getByRole('checkbox', { name: 'Select visible projects' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Actions for Design', exact: true })).toHaveCount(0);
    await page.getByRole('link', { name: 'Design', exact: true }).click();
    const newTask = page.getByRole('button', { name: 'New task', exact: true });
    await newTask.press('Enter');
    const editor = page.getByRole('dialog', { name: 'New task', exact: true });
    await expect(editor.getByLabel('Title')).toBeVisible();
    await expect(editor.getByLabel('Internal note')).toHaveCount(0);
    await expect(editor.getByLabel('Owner', { exact: true })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(editor).toBeHidden();
    await expect(newTask).toBeFocused();
  },
);
