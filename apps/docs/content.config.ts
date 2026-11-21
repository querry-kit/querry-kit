import { defineCollection, defineContentConfig } from '@nuxt/content';

export default defineContentConfig({
  collections: {
    example: defineCollection({ type: 'page', source: 'example.md' }),
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
    }),
  },
});
