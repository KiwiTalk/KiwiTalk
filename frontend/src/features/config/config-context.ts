import { Accessor, createContext, useContext } from 'solid-js';

export type Locale = { type: 'Auto' } | { type: 'Fixed', value: string };
export type GlobalConfig = {
  locale: Locale;
}

export type Config = { global: GlobalConfig; deviceLocale: string; };
export type ConfigSetter = (newConfig: DeepPartial<GlobalConfig>) => Promise<void>;

export const ConfigContext = createContext<[Accessor<Config>, ConfigSetter]>([
  () => ({
    global: {
      locale: { type: 'Auto' },
    },
    deviceLocale: 'en',
  } satisfies Config),
  async () => {},
]);
export const useConfig = () => useContext(ConfigContext);
