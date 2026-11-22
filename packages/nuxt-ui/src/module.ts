import { addComponent, createResolver, defineNuxtModule } from '@nuxt/kit';
import type { NuxtModule } from '@nuxt/schema';
import type { TableIconOverrides } from './runtime/icons';

export interface QuerryKitAppConfig {
  table?: {
    icons?: TableIconOverrides;
  };
}

declare module '@nuxt/schema' {
  interface CustomAppConfig {
    querryKit?: QuerryKitAppConfig;
  }

  interface AppConfig {
    querryKit?: {
      table?: QuerryKitAppConfig['table'];
    };
  }
}

export interface QuerryKitNuxtUiOptions {
  /** Register collision-safe QuerryKit table components for Nuxt auto-imports. */
  autoImports?: boolean;
}

const querryKitNuxtUiModule: NuxtModule<QuerryKitNuxtUiOptions> = defineNuxtModule<QuerryKitNuxtUiOptions>({
  meta: { name: '@querry-kit/nuxt-ui', configKey: 'querryKitUi', compatibility: { nuxt: '^4.0.0' } },
  defaults: { autoImports: true },
  setup(options) {
    const resolver = createResolver(import.meta.url);
    if (options.autoImports) {
      addComponent({
        name: 'QTableGroupLoadMore',
        filePath: resolver.resolve('runtime/components/table/group/load-more.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableGroup',
        filePath: resolver.resolve('runtime/components/table/group/index.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableGrouped',
        filePath: resolver.resolve('runtime/components/table/grouped/index.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableGrouping',
        filePath: resolver.resolve('runtime/components/table/grouping/index.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableFiltering',
        filePath: resolver.resolve('runtime/components/table/filtering/index.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableFilterLookup',
        filePath: resolver.resolve('runtime/components/table/filtering/lookup.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableOptions',
        filePath: resolver.resolve('runtime/components/table/options/index.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTablePagination',
        filePath: resolver.resolve('runtime/components/table/pagination/index.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableSorting',
        filePath: resolver.resolve('runtime/components/table/sorting/index.vue'),
        priority: 0,
      });
      addComponent({
        name: 'QTableToolbar',
        filePath: resolver.resolve('runtime/components/table/toolbar/index.vue'),
        priority: 0,
      });
    }
  },
});

export default querryKitNuxtUiModule;
