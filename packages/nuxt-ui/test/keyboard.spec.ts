import { describe, expect, it } from 'vitest';
import { canHandleTableShortcut } from '../src/runtime/utils/keyboard';

describe('canHandleTableShortcut', () => {
  it('accepts unclaimed shortcuts outside editable controls', () => {
    expect(canHandleTableShortcut(new KeyboardEvent('keydown', { key: 's', shiftKey: true }))).toBe(true);
  });

  it('leaves claimed shortcuts and text input alone', () => {
    const claimed = new KeyboardEvent('keydown', { cancelable: true });
    claimed.preventDefault();
    expect(canHandleTableShortcut(claimed)).toBe(false);

    const input = document.createElement('input');
    let canHandle = true;
    input.addEventListener('keydown', (event) => (canHandle = canHandleTableShortcut(event)));
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    expect(canHandle).toBe(false);
  });
});
