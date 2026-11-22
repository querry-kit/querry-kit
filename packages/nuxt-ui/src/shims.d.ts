declare module '#app' {
  import type { App } from 'vue';
  import type { TableIconOverrides } from './runtime/icons';

  export function useAppConfig(): {
    querryKit?: {
      table?: {
        icons?: TableIconOverrides;
      };
    };
  };

  export function defineNuxtPlugin(plugin: (nuxtApp: { vueApp: App }) => void): (nuxtApp: { vueApp: App }) => void;
}
