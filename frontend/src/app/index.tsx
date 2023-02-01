import './env';

import { useAsync } from '../hooks/async';

import { AppLogin } from './login';
import i18next from 'i18next';
import { getGlobalConfiguration, setCredential, initializeClient } from '../backend/app';
import { getDeviceLocale } from '../backend/system';
import { useEffect } from 'react';
import { LoginAccessData } from '../backend/auth';
import { createClientSession } from './session';

export const App = () => {
  const data = useAsync(async () => {
    const configuration = await getGlobalConfiguration();
    const deviceLocale = await getDeviceLocale();

    return {
      configuration,
      deviceLocale,
    };
  });

  useEffect(() => {
    if (data.status === 'pending' || data.status == 'error') {
      return;
    }

    if (data.value.configuration.locale.type == 'Auto') {
      i18next.changeLanguage(data.value.deviceLocale);
    } else {
      i18next.changeLanguage(data.value.configuration.locale.value);
    }
  }, [data.status]);

  function onLogin(data: LoginAccessData) {
    (async () => {
      await setCredential({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        userId: data.userId,
      });

      await initializeClient({ status: 'Unlocked' });

      for await (const event of createClientSession()) {
        // TODO::
      }
    })().then();
  }

  return <AppLogin onLogin={onLogin} />;
};
