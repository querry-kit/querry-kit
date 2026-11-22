/**
 * Determines whether a table control may claim a document-level shortcut.
 *
 * @param event - Keyboard event received by a control's document listener.
 * @returns `false` for handled events and editable controls.
 */
export function canHandleTableShortcut(event: KeyboardEvent): boolean {
  if (event.defaultPrevented) return false;

  const target = event.target;
  if (!(target instanceof HTMLElement)) return true;

  // Do not open a control while the user is entering a value in another control.
  return !target.isContentEditable && !['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}
