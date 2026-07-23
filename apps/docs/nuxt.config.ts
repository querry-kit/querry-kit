import { documentationRoutes } from './app/utils/docs';

export default defineNuxtConfig({
  modules: ['@nuxt/ui', '@nuxt/content', '@nuxt/fonts', '@querry-kit/nuxt-ui'],
  css: ['~/assets/main.css'],
  fonts: {
    defaults: {
      weights: [400, 500, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
    families: [
      { name: 'DM Sans', provider: 'google', global: true },
      { name: 'Geist', provider: 'google', global: true },
      { name: 'Inter', provider: 'google', global: true },
      { name: 'Outfit', provider: 'google', global: true },
    ],
  },
  compatibilityDate: '2026-07-23',
  app: {
    baseURL: process.env.NUXT_APP_BASE_URL ?? '/querry-kit/',
  },
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: documentationRoutes,
    },
  },
});
