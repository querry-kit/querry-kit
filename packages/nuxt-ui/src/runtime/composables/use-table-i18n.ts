import { getCurrentInstance, toValue, type MaybeRefOrGetter } from 'vue';
import { defaultTableTexts, type TableTextKey, type TableTextOverrides } from '../texts';

type Translate = (key: string, values: Record<string, unknown>, plural?: number) => unknown;
type TextValues = Record<string, string | number>;

const getText = (texts: TableTextOverrides | undefined, key: TableTextKey) =>
  key.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[segment];
  }, texts);

const getDefaultText = (key: TableTextKey) => getText(defaultTableTexts, key) as string;

const interpolate = (text: string, values: TextValues) =>
  text.replace(/\{([^}]+)\}/g, (placeholder, name: string) => String(values[name] ?? placeholder));

/** Resolves explicit component text, host-app i18n text, and English defaults in that order. */
export function useTableI18n(texts?: MaybeRefOrGetter<TableTextOverrides | undefined>) {
  const translate = getCurrentInstance()?.appContext.config.globalProperties.$t as Translate | undefined;
  return (key: TableTextKey, values: TextValues = {}, plural?: number) => {
    const override = getText(toValue(texts), key);
    if (typeof override === 'string') return interpolate(override, values);

    const i18nKey = `querrykit.table.${key}`;
    const result = plural === undefined ? translate?.(i18nKey, values) : translate?.(i18nKey, values, plural);
    return typeof result === 'string' && result !== i18nKey ? result : interpolate(getDefaultText(key), values);
  };
}

/** Formats display numbers with the host i18n locale when configured. */
export function useTableNumber() {
  const format = getCurrentInstance()?.appContext.config.globalProperties.$n as ((value: number) => string) | undefined;
  return (value: number) => format?.(value) ?? String(value);
}
