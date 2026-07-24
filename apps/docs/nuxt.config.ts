import { documentationRoutes } from './app/utils/docs';

const appBaseURL = process.env.NUXT_APP_BASE_URL ?? '/querry-kit/';
const siteURL = 'https://querry-kit.github.io';
const sitemapHomeURL = new URL(appBaseURL, `${siteURL}/`).href;

export default defineNuxtConfig({
  modules: ['@nuxtjs/sitemap', '@nuxt/ui', '@nuxt/content', '@nuxt/fonts', '@querry-kit/nuxt-ui'],
  css: ['~/assets/main.css'],
  icon: {
    provider: 'server',
    serverBundle: {
      collections: ['lucide', 'tabler'],
    },
    clientBundle: {
      scan: true,
    },
    fallbackToApi: false,
  },
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
    baseURL: appBaseURL,
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: `${appBaseURL}favicon.svg` }],
    },
  },
  site: {
    name: 'Querry Kit',
    url: siteURL,
  },
  sitemap: {
    excludeAppSources: true,
    urls: [{ loc: sitemapHomeURL }, ...documentationRoutes],
    discoverImages: false,
    zeroRuntime: true,
  },
  nitro: {
    prerender: {
      concurrency: 1,
      crawlLinks: false,
      routes: documentationRoutes,
    },
  },
});
