import { AppLogin } from './login';
import { getGlobalConfiguration, setCredential, initializeClient } from '../ipc/app';
import { getDeviceLocale } from '../ipc/system';
import { LoginAccessData } from '../ipc/auth';
import { AppMain } from './main';
import { Show, createEffect, createResource, createSignal } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

export const App = () => {
  const [, { changeLanguage }] = useTransContext();

  // TODO:: replace to proper implementation
  const [logon, setLogon] = createSignal(false);

  const [data] = createResource(async () => {
    const configuration = await getGlobalConfiguration();
    const deviceLocale = await getDeviceLocale();

    return {
      configuration,
      deviceLocale,
    };
  });

  createEffect(() => {
    const target = data();

    if (data.loading || data.error) return;
    if (!target) return;

    if (target.configuration.locale.type === 'Auto') {
      changeLanguage(target.deviceLocale);
    } else {
      changeLanguage(target.configuration.locale.value);
    }
  });

  const onLogin = async (data: LoginAccessData) => {
    await setCredential({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      userId: data.userId,
    });

    await initializeClient({ status: 'Unlocked' });

    setLogon(true);
  };

  return (
    <Show
      when={logon()}
      fallback={<AppLogin onLogin={onLogin} />}
    >
      <AppMain profile={{ name: 'TODO', contact: 'example@example.com' }} />
    </Show>
  );
};
