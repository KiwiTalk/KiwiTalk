import { ParentProps, createResource } from 'solid-js';
import { deepmerge } from 'deepmerge-ts';

import { loadConfig, saveConfig } from '../../api/config';
import { getDeviceLocale } from '../../api/system';
import { ConfigurationContext, GlobalConfiguration } from '../../store/global';
import { DeepPartial } from '../../utils';

const ConfigurationProvider = (props: ParentProps) => {
  const [data, { refetch }] = createResource(async () => {
    const configuration = await loadConfig();
    const deviceLocale = await getDeviceLocale();

    return {
      configuration,
      deviceLocale,
    };
  });

  const getConfig = () => data() ?? ConfigurationContext.defaultValue[0]();
  const setConfig = async (newConfig: DeepPartial<GlobalConfiguration>) => {
    const defaultConfig = data()?.configuration ?? await loadConfig();
    const merged = deepmerge(defaultConfig, newConfig) as GlobalConfiguration;

    await saveConfig(merged);
    refetch();
  };

  return (
    <ConfigurationContext.Provider value={[getConfig, setConfig]}>
      {props.children}
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationProvider;
