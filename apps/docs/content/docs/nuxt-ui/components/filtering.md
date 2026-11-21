# Filtering

`QTableFiltering` edits a Query Kit-compatible `Filtering` value. It owns the editor state and emits immutable replacements; the application serializes the result for its API.

<DemosTableFiltering></DemosTableFiltering>

## Inputs and state

| Prop/model          | Default           | Description                                                                     |
| ------------------- | ----------------- | ------------------------------------------------------------------------------- |
| `v-model:filtering` | required          | `FilteringMode.Intersect` (`AND`) or `FilteringMode.Union` (`OR`) plus filters. |
| `fields`            | required          | `FilterField[]` definitions for the available editors.                          |
| `context-active` | `false` | Highlights the trigger and enables clearing when an external filter is active. |
| `icon`              | `i-tabler-filter` | Trigger icon.                                                                   |
| `shortcuts`         | `true`            | Enables <kbd>Shift</kbd> + <kbd>F</kbd>.                                        |
| `texts`             | —                 | Explicit text overrides, ahead of i18n and English defaults.                    |
| `icons`             | —                 | Nested Iconify-name overrides for every default icon.                            |
| `ui.content`        | —                 | Extra classes for the control panel content.                                  |

The trigger changes to the primary color when filters are active. Disabled fields are excluded from the add selector.

## Popover actions

- **Change filter mode** — the header button switches between `AND` and `OR` while retaining every filter.
- **Clear filters** — the header action resets the value to an empty `AND` filter group.
- **Add filter** — choose an enabled field and press the plus button. The initial operator and value are derived from its type.
- **Edit a boolean** — the default checkbox writes `true` or `false`.
- **Edit a number** — choose `=`, `≠`, `>`, `≥`, `<`, or `≤`, then enter a number.
- **Edit enum and select fields** — choose `∈` or `∉` and select multiple values. Enum fields may provide a custom component; select fields require one.
- **Remove filter** — press the remove button next to an entry.

```vue
<QTableFiltering v-model:filtering="filtering" :fields="filterFields" />
```

## Slots

| Slot      | Useful slot props                     |
| --------- | ------------------------------------- |
| `trigger` | `open`, `toggle`, `active`            |
| `header`  | `filtering`, `clear`, `toggleMode`    |
| `items`   | `filters`, `remove`, `update`         |
| `item`    | `filter`, `field`, `remove`, `update` |
| `add`     | `fields`, `add`                       |

Use the `item` slot for an entirely custom per-field editor; use a field's `component` when only its value input differs.

Use the `context` slot for application-owned filters above the rule list, such as a project selector. Set `context-active` when a selection is active and handle the `clear` event to reset it alongside the rule list.

### Searchable lookup filters

Use `QTableFilterLookup` as the component for a `select` field. Supply a
`FilterLookupSource` through `componentProps`. The source exposes `search(term)`
for matching choices and `resolve(values)` for selected labels, including values
from bookmarked filters. Each method returns `{ value, label }` choices. An empty
search loads the initial choices.

```ts
import { QTableFilterLookup } from '#components';
import type { FilterField } from '@querry-kit/nuxt-ui/types';

const projectField = {
  type: 'select',
  value: 'project.id',
  label: 'Project',
  component: QTableFilterLookup,
  componentProps: { source: projectLookup, maxSelections: 100 },
} satisfies FilterField;
```

The application supplies the endpoint, field path, and optional selection limit.
The lookup also works outside the filter toolbar with an array `v-model`, a
`source`, and an accessible label.

## Customize lookup content

`QTableFilterLookup` accepts `#selection` for the trigger content, `#option` for
option content, `#empty` for the empty list, and `#error` for request errors.
The option slot receives `item`, `index`, and `selected`. The selection slot
receives `selection`, `items`, `open`, and `update`. The empty slot receives
`searchTerm` and `loading`. The error slot receives `searchError`,
`selectionError`, and `retry`. Nuxt UI retains keyboard navigation and option
selection around the custom content.

The default trigger opens the panel. The header renders the mode and clear actions. The default list picks an editor according to the field type and the add row offers enabled fields. At list level, `remove(id)` or `update(id, replacement)` target the rule ID. At item level, `remove()` and `update(replacement)` already target that rule. `add(fieldId)` creates a rule. The `context` slot takes no arguments and defaults to empty. The model emits `update:filtering` and clearing emits `clear` without arguments. A toolbar switches the panel to a dialog on small screens.

### QTableFilterLookup inputs and defaults

| Input | Type and default | Behavior |
| --- | --- | --- |
| `v-model` | Required `(string \| number)[]` | Selected values. Emits `update:modelValue`. |
| `source` | Required `FilterLookupSource` | Searches for choices and resolves labels for the current selection independently. |
| `max-selections` | Optional `number`, unlimited when omitted | Disables additional unselected options at the limit. Selected options remain removable. |
| `texts` | Optional `TableTextOverrides` | Overrides placeholder and error text. |
| Fallthrough attributes | Native Nuxt UI SelectMenu attributes | Forwarded to the select so the app can set its accessible name and presentation. |

The default selection and option displays use Nuxt UI, including its keyboard behavior. `empty` defaults to its localized empty state. `error` defaults to a non-destructive alert and retry button. `retry()` reissues the lookup requests. `item` and the entries in `items` have `value`, `label`, and computed `disabled`.
