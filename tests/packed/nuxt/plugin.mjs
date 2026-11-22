import { createApiClient } from '@querry-kit/nuxt/api';
export default defineNuxtPlugin(() => ({
  provide: { api: createApiClient({ apiBaseUrl: 'https://api.example.test' }) },
}));
