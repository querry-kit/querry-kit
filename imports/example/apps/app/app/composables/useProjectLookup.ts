import { useAutocomplete } from '@querry-kit/nuxt';
import { refDebounced } from '@vueuse/core';
import type { ProjectLookup } from '@workboard/contracts';
import type { Ref } from 'vue';

import { projectSearchQuery } from '~/utils/project-lookup';

/** Keeps selected project titles available while searching the permitted project list. */
export function useProjectLookup(selection: Ref<string | undefined>) {
  const search = ref('');
  const debounced = refDebounced(search, 250);
  const { $workboardApi } = useNuxtApp();
  const query = computed(
    /** Searches project titles without filtering the separately hydrated selection. */
    () => projectSearchQuery(debounced.value),
  );
  const source = { api: $workboardApi, endpoint: 'projects' };
  const results = useAutocomplete<ProjectLookup>({ ...source, query });
  const selected = useAutocomplete<ProjectLookup>({ ...source, currentValue: selection, immediate: false });
  onMounted(selected.loadCurrentItems);

  const items = computed(
    /** Combines hydrated selections and matching results by project ID. */
    () => {
      const byId = new Map<string, ProjectLookup>();
      for (const item of [...selected.currentValueItems.value, ...results.items.value]) byId.set(item.id, item);
      return [...byId.values()];
    },
  );
  return {
    search,
    items,
    loading: computed(/** Reports both active reads. */ () => results.loading.value || selected.loading.value),
    error: computed(/** Reports a search or hydration error. */ () => results.error.value ?? selected.error.value),
  };
}
