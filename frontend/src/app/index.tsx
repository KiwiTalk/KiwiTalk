import { AppLogin } from './login';
import { setCredential, initializeClient } from '../ipc/app';
import { LoginAccessData } from '../ipc/auth';
import { AppMain } from './main';
import { Show, createEffect, createSignal, on } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';
import { useConfiguration } from '../store/global';

export const App = () => {
  const [, { changeLanguage }] = useTransContext();
  const [config] = useConfiguration();

  // TODO:: replace to proper implementation
  const [logon, setLogon] = createSignal(false);

  createEffect(on(config, (config) => {
    if (!config) return;

    if (config.configuration.locale.type === 'Auto') {
      changeLanguage(config.deviceLocale);
    } else {
      changeLanguage(config.configuration.locale.value);
    }
  }));

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
