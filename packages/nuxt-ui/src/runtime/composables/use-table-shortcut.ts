import { onBeforeUnmount, onMounted } from 'vue';
import { canHandleTableShortcut } from '../utils/keyboard';

/** Claims a Shift-only shortcut when its control is available and handles the action. */
export function useTableShortcut(key: string, enabled: () => boolean, activate: () => boolean | void): void {
  const handle = (event: KeyboardEvent) => {
    if (
      !enabled() ||
      !event.shiftKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.repeat ||
      event.isComposing
    )
      return;
    if (
      !canHandleTableShortcut(event) ||
      (event.target instanceof Element && event.target.closest('[aria-modal="true"]'))
    )
      return;
    const pressed = event.key.toLowerCase();
    if (pressed !== key && !(key === '/' && pressed === '?')) return;
    if (activate() !== false) event.preventDefault();
  };
  onMounted(() => document.addEventListener('keydown', handle));
  onBeforeUnmount(() => document.removeEventListener('keydown', handle));
}
