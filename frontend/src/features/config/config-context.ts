import { Accessor, createContext, useContext } from 'solid-js';

export type Locale = { type: 'Auto' } | { type: 'Fixed', value: string };
export type GlobalConfig = {
  locale: Locale;
}

export type Config = { configuration: GlobalConfig; deviceLocale: string; };
export type ConfigSetter = (newConfig: DeepPartial<GlobalConfig>) => Promise<void>;

export const ConfigContext = createContext<[Accessor<Config>, ConfigSetter]>([
  () => ({
    configuration: {
      locale: { type: 'Auto' },
    },
    deviceLocale: 'en',
  } satisfies Config),
  async () => {},
]);
export const useConfig = () => useContext(ConfigContext);

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};
