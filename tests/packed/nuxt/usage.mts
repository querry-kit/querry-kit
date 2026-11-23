import { createApiClient } from '@querry-kit/nuxt/api';
const url: string | undefined = createApiClient({ apiBaseUrl: 'https://example.test' }).defaults.baseURL;
void url;
