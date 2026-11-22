import { createApiClient } from '@querry-kit/nuxt';
import {
  apiErrorSchema,
  demoSessionSchema,
  labelLookupPageSchema,
  projectLookupPageSchema,
  projectLookupSchema,
  projectTablePageSchema,
  taskAggregateSchema,
  taskGroupsSchema,
  taskPageSchema,
  taskSchema,
} from '@workboard/contracts';

export default defineNuxtPlugin(
  /**
   * Configures the shared Query Kit client and validates payloads before any table or lookup can consume them.
   *
   * @see https://querry-kit.github.io/querry-kit/docs/nuxt/api/api/
   */
  () => {
    const api = createApiClient({ apiBaseUrl: useRequestURL().origin });
    let reads = new AbortController();

    /** Cancels requests made for the previous account before the server cookie is replaced. */
    function invalidateWorkboardReads(): void {
      reads.abort();
      reads = new AbortController();
    }

    // This example exposes `/api` on the Nuxt origin. Keep the package default for a versioned `/api/v1` API.
    api.defaults.baseURL = '/api';
    api.interceptors.request.use(
      /** Attaches the active account's cancellation signal to every data read. */
      (config) => {
        if (/^\/(?:tasks|projects|labels)(?:[/?]|$)/.test(config.url ?? '')) {
          config.signal = reads.signal;
        }
        return config;
      },
    );
    api.interceptors.response.use(
      /** Validates each known resource response by its public route, separate from TypeScript's static types. */
      (response) => {
        const route = response.config.url?.split('?')[0] ?? '';
        if (route === '/demo/session') response.data = demoSessionSchema.parse(response.data);
        const method = response.config.method;
        if (response.status !== 204 && (method === 'post' || method === 'patch')) {
          if (route === '/tasks' || route.startsWith('/tasks/')) response.data = taskSchema.parse(response.data);
          if (route === '/projects' || route.startsWith('/projects/')) {
            response.data = projectLookupSchema.parse(response.data);
          }
        }
        if (method !== 'get') return response;
        if (route === '/tasks') response.data = taskPageSchema.parse(response.data);
        if (route === '/projects') response.data = projectLookupPageSchema.parse(response.data);
        if (route === '/projects/table') response.data = projectTablePageSchema.parse(response.data);
        if (route === '/labels') response.data = labelLookupPageSchema.parse(response.data);
        if (route === '/tasks/group-by') response.data = taskGroupsSchema.parse(response.data);
        else if (route === '/tasks/aggregate') response.data = taskAggregateSchema.parse(response.data);
        else if (/^\/tasks\/(?:find-by-id\/)?[^/]+$/.test(route) && route !== '/tasks/count') {
          response.data = taskSchema.parse(response.data);
        }
        return response;
      },
      /** Preserves status while exposing only validated public error messages. */
      (error: unknown) => {
        if (typeof error !== 'object' || !error || !('response' in error)) throw error;
        const response = error.response;
        if (typeof response !== 'object' || !response || !('data' in response)) throw error;
        const payload = apiErrorSchema.safeParse(response.data);
        if (!payload.success) throw error;
        throw Object.assign(new Error(payload.data.message), { statusCode: payload.data.statusCode });
      },
    );

    return { provide: { workboardApi: api, invalidateWorkboardReads } };
  },
);
