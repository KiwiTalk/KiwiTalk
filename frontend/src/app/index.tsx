import './env';

import { useAsync } from '../hooks/async';

import { AppLogin } from './login';
import i18next from 'i18next';
import { getGlobalConfiguration } from '../backend/app';
import { getDeviceLocale } from '../backend/system';

export const App = () => {
  const data = useAsync(async () => {
    const configuration = await getGlobalConfiguration();
    const deviceLocale = await getDeviceLocale();

    return {
      configuration,
      deviceLocale,
    };
  });

  if (data.status === 'pending' || data.status == 'error') {
    return;
  }

  if (data.value.configuration.locale.type == 'Auto') {
    i18next.changeLanguage(data.value.deviceLocale);
  } else {
    i18next.changeLanguage(data.value.configuration.locale.value);
  }

  return <>
    <AppLogin />
  </>;
};
