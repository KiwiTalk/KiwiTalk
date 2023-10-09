import { AppLogin } from './login';
import { AppMain } from './main';
import { Match, Switch, createEffect, createResource, createSignal, on } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';
import { useConfiguration } from '../store/global';
import { autoLogin, logon, logout } from '../ipc/api';

export const App = () => {
  const [t, { changeLanguage }] = useTransContext();
  const [config] = useConfiguration();

  const [loginState, setLoginState] = createSignal(false);

  const [errorMessage, setErrorMessage] = createSignal<string>();

  createResource(async () => {
    if (await logon()) {
      setLoginState(true);
      return;
    }

    try {
      const res = await autoLogin();
      if (res.type === 'Success') {
        if (res.content) {
          setLoginState(true);
        }
      } else {
        setErrorMessage(t(`login.status.login.${res.content}`));
      }
    } catch (err) {
      setErrorMessage(t(`login.reason.auto_login_failed`));
      console.error(err);
    }
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
      <Match when={!loginState()}>
        <AppLogin errorMessage={errorMessage()} onLogin={() => {
          setErrorMessage();
          setLoginState(true);
        }} />
      </Match>
      <Match when={loginState()}>
        <AppMain onLogout={async (reason) => {
          await logout();
          setLoginState(false);

          if (reason.type === 'Kickout') {
            setErrorMessage(t(`login.reason.kickout.${reason.reasonId}`));
          } else if (reason.type === 'Disconnected') {
            setErrorMessage(t('login.disconnected'));
          } else if (reason.type === 'Error') {
            setErrorMessage(t('login.generic_error'));
            console.error(reason.err);
          }
        }} />
      </Match>
    </Switch>
  );
};
