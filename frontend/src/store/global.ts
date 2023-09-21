import { Accessor, createContext, useContext } from 'solid-js';
import { DeepPartial } from '../utils';

export type Locale = { type: 'Auto' } | { type: 'Fixed', value: string };
export type AuthConfiguration = (
  { type: 'None' }
  | { type: 'SaveAccount'; email: string; }
  | { type: 'AutoLogin'; email: string; token: string; }
);

export type GlobalConfiguration = {
  locale: Locale;
  auth: AuthConfiguration;
}

export type Configuration = { configuration: GlobalConfiguration; deviceLocale: string; };
export type ConfigurationSetter = (newConfig: DeepPartial<GlobalConfiguration>) => Promise<void>;

export const ConfigurationContext = createContext<[Accessor<Configuration>, ConfigurationSetter]>([
  () => ({
    configuration: {
      locale: { type: 'Auto' },
      auth: { type: 'None' },
    },
    deviceLocale: 'en',
  } satisfies Configuration),
  async () => {},
]);
export const useConfiguration = () => useContext(ConfigurationContext);
