import { onMounted, reactive } from 'vue';

const germanTexts = {
  pagination: {
    summary: '{start}–{end} von {total}',
    mode: 'Lademodus',
    paginated: 'Seitennavigation',
    infinite: 'Endlos scrollen',
    loaded: '{count} von {total} geladen',
    loadMore: 'Mehr laden',
    loading: 'Zeilen werden geladen …',
    error: 'Zeilen konnten nicht geladen werden.',
    retry: 'Erneut versuchen',
  },
  grouping: {
    loadMore: 'Mehr laden',
    retry: 'Erneut versuchen',
  },
};

/**
 * Demonstrates the footer's text overrides using the browser's preferred language.
 * @returns {Partial<typeof germanTexts>} Reactive overrides for German browsers.
 */
export function useDemoTableLoadingTexts() {
  const texts = reactive<Partial<typeof germanTexts>>({});
  onMounted(() => {
    if (navigator.language.toLowerCase().startsWith('de')) Object.assign(texts, germanTexts);
  });
  return texts;
}
