export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@querry-kit/nuxt-ui'],
  css: ['~/assets/main.css'],
  compatibilityDate: '2026-07-22',
  runtimeConfig: { public: { apiBase: process.env.NUXT_PUBLIC_API_BASE ?? 'http://localhost:3101' } },
});
