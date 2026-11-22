import { useAppConfig } from '#app';
import { defaultTableIcons, type TableIconKey, type TableIconOverrides } from '../icons';

const getIcon = (icons: TableIconOverrides | typeof defaultTableIcons, key: TableIconKey) =>
  key.split('.').reduce<unknown>((value, segment) => {
    if (!value || typeof value !== 'object') return undefined;
    return (value as Record<string, unknown>)[segment];
  }, icons);

/** Resolves component and app-config icon overrides with the package default as fallback. */
export function useTableIcons(icons?: TableIconOverrides) {
  const appIcons = useAppConfig().querryKit?.table?.icons;

  return (key: TableIconKey) => {
    const componentIcon = icons && getIcon(icons, key);
    if (typeof componentIcon === 'string') return componentIcon;

    const appIcon = appIcons && getIcon(appIcons, key);
    return typeof appIcon === 'string' ? appIcon : (getIcon(defaultTableIcons, key) as string);
  };
}
