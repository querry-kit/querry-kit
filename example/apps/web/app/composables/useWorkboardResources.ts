import { useModuleApi, type EndpointDefinition } from '@querry-kit/nuxt';
import type { ProjectCreate, ProjectLookup, ProjectUpdate, Task, TaskCreate, TaskUpdate } from '@workboard/contracts';

type Resources = {
  projects: EndpointDefinition<ProjectLookup, ProjectCreate, ProjectUpdate>;
  tasks: EndpointDefinition<Task, TaskCreate, TaskUpdate>;
};

/** Provides the typed Query Kit client for an editable Workboard resource. */
export function useWorkboardResources<T extends keyof Resources>(endpoint: T) {
  const api = useModuleApi<Resources, T>(useNuxtApp().$workboardApi, endpoint);
  const { mutate } = useDemoSession();
  /** Preserves each method's signature and guards the entire mutation promise. */
  function guarded<A extends unknown[], R>(method: (...args: A) => Promise<R>) {
    return /** Sends exactly once for the active persona. */ (...args: A) =>
      mutate(/** Forwards the original typed arguments. */ () => method(...args));
  }
  return { ...api, create: guarded(api.create), update: guarded(api.update), delete: guarded(api.delete) };
}
