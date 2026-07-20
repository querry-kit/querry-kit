import { defineConfig } from 'vitepress';

const base = process.env.VITEPRESS_BASE ?? '/querry-kit/';
const withBase = (path: string) => `${base.replace(/\/$/, '')}${path}`;

export default defineConfig({
  title: 'Querry Kit',
  description: 'Composable, type-safe query tooling for NestJS APIs.',
  base,
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', href: withBase('/logo/querry-kit-logo.svg') }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Querry Kit' }],
    [
      'meta',
      {
        property: 'og:description',
        content: 'Composable, type-safe query tooling for NestJS APIs.'
      }
    ],
    ['meta', { property: 'og:image', content: withBase('/logo/querry-kit-wordmark.svg') }]
  ],
  themeConfig: {
    logo: '/logo/querry-kit-logo.svg',
    siteTitle: 'Querry Kit',
    nav: [
      { text: 'Repositories', link: '#repositories' },
      { text: 'GitHub', link: 'https://github.com/querry-kit' }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/querry-kit' }]
  }
});
