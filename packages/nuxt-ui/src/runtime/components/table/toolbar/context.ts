import type { InjectionKey, Ref } from 'vue';

export const toolbarSmallKey: InjectionKey<Readonly<Ref<boolean>>> = Symbol('tableToolbarSmall');
