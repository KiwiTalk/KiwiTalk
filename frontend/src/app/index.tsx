import { AppLogin } from './login';
import { ClientState, getClientState } from '../ipc/client';
import { AppMain } from './main';
import { Match, Switch, createEffect, createResource, createSignal, on } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';
import { useConfiguration } from '../store/global';

export const App = () => {
  const [, { changeLanguage }] = useTransContext();
  const [config] = useConfiguration();

  const [state, setState] = createSignal<ClientState>('NeedLogin');

  createResource(state, async () => {
    setState(await getClientState());
  });

  createEffect(on(config, (config) => {
    if (!config) return;

    if (config.configuration.locale.type === 'Auto') {
      changeLanguage(config.deviceLocale);
    } else {
      changeLanguage(config.configuration.locale.value);
    }
  }));

  return (
    <Switch>
      <Match when={state() === 'NeedLogin'}>
        <AppLogin onLogin={() => setState('Logon')} />
      </Match>
      <Match when={state() === 'Logon'}>
        <AppMain onLogout={() => setState('NeedLogin')} />
      </Match>
    </Switch>
  );
};
