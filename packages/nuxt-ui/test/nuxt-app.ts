let appConfig: Record<string, unknown> = {};

export function setAppConfig(config: Record<string, unknown>) {
  appConfig = config;
}

export function useAppConfig() {
  return appConfig;
}

export function defineNuxtPlugin<T>(plugin: T): T {
  return plugin;
}
