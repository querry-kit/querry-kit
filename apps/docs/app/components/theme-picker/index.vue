<template>
  <UPopover v-model:open="open" :ui="{ content: 'w-72 px-6 py-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-5rem)]' }">
    <UButton
      icon="i-lucide-swatch-book"
      color="neutral"
      :variant="open ? 'soft' : 'ghost'"
      square
      aria-label="Theme settings"
      :ui="{ leadingIcon: 'text-primary' }"
    />

    <template #content>
      <div class="flex flex-col gap-4">
        <fieldset>
          <legend class="mb-2 text-[11px] font-semibold leading-none">Primary</legend>
          <div class="-mx-2 grid grid-cols-3 gap-1">
            <ThemePickerOption label="Black" :selected="settings.blackAsPrimary" @click="settings.blackAsPrimary = true">
              <template #leading>
                <span class="inline-block size-2 rounded-full bg-black dark:bg-white" />
              </template>
            </ThemePickerOption>
            <ThemePickerOption
              v-for="color in primaryColors"
              :key="color"
              :label="color"
              :chip="color"
              :selected="!settings.blackAsPrimary && settings.primary === color"
              @click="setPrimary(color)"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-[11px] font-semibold leading-none">Neutral</legend>
          <div class="-mx-2 grid grid-cols-3 gap-1">
            <ThemePickerOption
              v-for="color in neutralColors"
              :key="color"
              :label="color"
              :chip="color === 'neutral' ? 'old-neutral' : color"
              :selected="settings.neutral === color"
              @click="settings.neutral = color"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-[11px] font-semibold leading-none">Radius</legend>
          <div class="-mx-2 grid grid-cols-5 gap-1">
            <ThemePickerOption
              v-for="item in radiuses"
              :key="item"
              :label="String(item)"
              :selected="settings.radius === item"
              class="justify-center px-0"
              @click="settings.radius = item"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-[11px] font-semibold leading-none">Font</legend>
          <div class="-mx-2">
            <USelect
              v-model="settings.font"
              :items="fonts"
              size="sm"
              color="neutral"
              icon="i-lucide-type"
              class="w-full rounded-sm text-[11px] ring-default hover:bg-elevated/50 data-[state=open]:bg-elevated/50"
              :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
            />
          </div>
        </fieldset>

        <fieldset>
          <legend class="mb-2 text-[11px] font-semibold leading-none">Color mode</legend>
          <div class="-mx-2 grid grid-cols-3 gap-1">
            <ThemePickerOption
              v-for="item in modes"
              :key="item.label"
              :label="item.label"
              :icon="item.icon"
              :selected="colorMode.preference === item.label"
              @click="colorMode.preference = item.label"
            />
          </div>
        </fieldset>

        <UButton
          v-if="hasChanges || colorMode.preference !== 'system'"
          color="neutral"
          variant="soft"
          size="sm"
          icon="i-lucide-rotate-ccw"
          label="Reset theme"
          @click="resetTheme"
        />
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
type ThemeSettings = {
  blackAsPrimary: boolean;
  primary: string;
  neutral: string;
  radius: number;
  font: string;
};

const storageKey = 'querry-kit-docs-theme';
const defaults: ThemeSettings = {
  blackAsPrimary: false,
  primary: 'red',
  neutral: 'zinc',
  radius: 0.25,
  font: 'System UI',
};

const primaryColors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
const neutralColors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive'];
const radiuses = [0, 0.125, 0.25, 0.375, 0.5];
const fonts = ['System UI', 'DM Sans', 'Geist', 'Inter', 'Outfit'];
const modes = [
  { label: 'light', icon: 'i-lucide-sun' },
  { label: 'dark', icon: 'i-lucide-moon' },
  { label: 'system', icon: 'i-lucide-monitor' },
];

const open = ref<boolean>(false);
const settings = useState<ThemeSettings>('docs-theme-settings', () => ({ ...defaults }));
const appConfig = useAppConfig();
const colorMode = useColorMode();

const colors = appConfig.ui.colors as { primary: string; neutral: string };
const fontFamily = computed<string>(() => settings.value.font === 'System UI' ? 'ui-sans-serif, system-ui, sans-serif' : `'${settings.value.font}', ui-sans-serif, system-ui, sans-serif`);
const hasChanges = computed<boolean>(() => Object.entries(defaults).some(([key, value]) => settings.value[key as keyof ThemeSettings] !== value));

function applySettings() {
  colors.primary = settings.value.primary;
  colors.neutral = settings.value.neutral;
}

function setPrimary(color: string) {
  settings.value.primary = color;
  settings.value.blackAsPrimary = false;
}

function resetTheme() {
  settings.value = { ...defaults };
  colorMode.preference = 'system';
}

watch(settings, () => {
  applySettings();
  if (import.meta.client) {
    window.localStorage.setItem(storageKey, JSON.stringify(settings.value));
  }
}, { deep: true, immediate: true });

onMounted(() => {
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || '{}') as Partial<ThemeSettings>;
    const nextSettings = { ...defaults, ...saved };
    if (primaryColors.includes(nextSettings.primary) && neutralColors.includes(nextSettings.neutral) && radiuses.includes(nextSettings.radius) && fonts.includes(nextSettings.font)) {
      settings.value = nextSettings;
    }
  } catch {
    window.localStorage.removeItem(storageKey);
  }
});

useHead({
  style: [{
    id: 'querry-kit-docs-theme',
    innerHTML: computed<string>(() => `${settings.value.blackAsPrimary ? ':root { --ui-primary: black; } .dark { --ui-primary: white; }' : ''} :root { --ui-radius: ${settings.value.radius}rem; --font-sans: ${fontFamily.value}; }`),
  }],
});
</script>
