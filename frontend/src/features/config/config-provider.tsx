import { ParentProps, createResource } from 'solid-js';
import { deepmerge } from 'deepmerge-ts';

import { loadConfig, saveConfig } from '@/api/config';
import { getDeviceLocale } from '@/api/system';
import { GlobalConfig } from '@/api/_types';
import { ConfigContext } from './config-context';

export const ConfigProvider = (props: ParentProps) => {
  const [data, { refetch }] = createResource(async () => {
    const global = await loadConfig();
    const deviceLocale = await getDeviceLocale();

    return {
      global,
      deviceLocale,
    };
  });

  const getConfig = () => data() ?? ConfigContext.defaultValue[0]();
  const setConfig = async (newConfig: DeepPartial<GlobalConfig>) => {
    const defaultConfig = data()?.global ?? await loadConfig();
    const merged = deepmerge(defaultConfig, newConfig) as GlobalConfig;

    await saveConfig(merged);
    refetch();
  };

  return (
    <ConfigContext.Provider value={[getConfig, setConfig]}>
      {props.children}
    </ConfigContext.Provider>
  );
};
