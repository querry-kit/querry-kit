import { useModuleApi, type EndpointDefinition } from '@querry-kit/nuxt';
import type { ProjectCreate, ProjectLookup, ProjectUpdate, Task, TaskCreate, TaskUpdate } from '@workboard/contracts';

type Resources = {
  projects: EndpointDefinition<ProjectLookup, ProjectCreate, ProjectUpdate>;
  tasks: EndpointDefinition<Task, TaskCreate, TaskUpdate>;
};

/** Provides the typed Query Kit client for an editable Workboard resource. */
export function useWorkboardResources<T extends keyof Resources>(endpoint: T) {
  return useModuleApi<Resources, T>(useNuxtApp().$workboardApi, endpoint);
}
