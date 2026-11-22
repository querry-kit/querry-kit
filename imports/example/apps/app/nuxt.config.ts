export default defineNuxtConfig({
  // Register Querry Kit after Nuxt UI so the example can use its auto-imported table controls.
  // https://querry-kit.github.io/querry-kit/docs/nuxt-ui/guide/getting-started/
  modules: ['@nuxt/ui', '@querry-kit/nuxt-ui'],
  css: ['~/assets/main.css'],
  compatibilityDate: '2026-11-19',
  devtools: { enabled: false },
  ui: { fonts: false },
  // Keep Nuxt's own icon requests out of the example API proxy.
  icon: { localApiEndpoint: '/_workboard_icon' },
  runtimeConfig: {
    // Private Nitro setting; the browser only sees same-origin /api and /docs URLs.
    apiOrigin: 'http://127.0.0.1:3101',
  },
});
