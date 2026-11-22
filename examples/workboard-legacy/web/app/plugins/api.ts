import { createApiClient, useModuleApi } from '@querry-kit/nuxt/api';

export type Project = {
  id: string;
  name: string;
  updatedAt: string;
  workspace?: { name: string };
  tasks?: Array<{ id: string; title: string; status: string; labels?: Array<{ name: string }> }>;
};
export type WorkboardEndpoints = {
  projects: { item: Project; create: { name: string; workspaceId: string }; update: never };
};

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  const api = createApiClient({ apiBaseUrl: config.public.apiBase, requestSource: 'workboard-example' });
  return {
    provide: { workboardApi: api, workboardProjects: useModuleApi<WorkboardEndpoints, 'projects'>(api, 'projects') },
  };
});
