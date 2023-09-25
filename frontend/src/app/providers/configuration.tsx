import { ParentProps, createResource } from 'solid-js';
import { deepmerge } from 'deepmerge-ts';

import { getGlobalConfiguration, setGlobalConfiguration } from '../../ipc/client';
import { getDeviceLocale } from '../../ipc/system';
import { ConfigurationContext, GlobalConfiguration } from '../../store/global';
import { DeepPartial } from '../../utils';

const ConfigurationProvider = (props: ParentProps) => {
  const [data, { refetch }] = createResource(async () => {
    const configuration = await getGlobalConfiguration();
    const deviceLocale = await getDeviceLocale();

    return {
      configuration,
      deviceLocale,
    };
  });

  const getConfig = () => data() ?? ConfigurationContext.defaultValue[0]();
  const setConfig = async (newConfig: DeepPartial<GlobalConfiguration>) => {
    const defaultConfig = data()?.configuration ?? await getGlobalConfiguration();
    const merged = deepmerge(defaultConfig, newConfig) as GlobalConfiguration;

    setGlobalConfiguration(merged);
    refetch();
  };

  return (
    <ConfigurationContext.Provider value={[getConfig, setConfig]}>
      {props.children}
    </ConfigurationContext.Provider>
  );
};

export default ConfigurationProvider;
