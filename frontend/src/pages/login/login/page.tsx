import { useTransContext } from '@jellybrick/solid-i18next';

import { Button } from '@/ui-common/button';
import { Input } from '@/ui-common/input';

import * as styles from './page.css';

import IconUser from '@/assets/icons/user.svg';
import IconKey from '../_assets/icons/key.svg';
import { Show, createEffect, createSignal } from 'solid-js';
import { login } from '@/api';
import { useNavigate, useRouteData } from '@solidjs/router';

export const LoginContentPage = () => {
  const [t] = useTransContext();
  const navigate = useNavigate();
  const refreshLoginState = useRouteData<() => () => void>();

  let loginInput: HTMLInputElement | undefined;
  let passwordInput: HTMLInputElement | undefined;

  const [error, setError] = createSignal<string | null>(null);
  const [forced, setForced] = createSignal(false);

  createEffect((prevTimeout: NodeJS.Timeout | undefined) => {
    if (typeof error() === 'string') {
      if (prevTimeout !== undefined) clearTimeout(prevTimeout);

      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);

      return timeout;
    }
  });

  const onLogin = async (event: Event) => {
    event.preventDefault();

    if (!loginInput?.value || !passwordInput?.value) {
      setError(t(`login.reason.required_id_password`));
      return;
    }

    try {
      const response = await login({
        email: loginInput.value,
        password: passwordInput.value,
        saveEmail: true, // input.saveId,
        autoLogin: false, // input.autoLogin,
      }, forced());

      if (response.type === 'Success') {
        refreshLoginState();
        navigate('/');
        return;
      }

      switch (response.content) {
      case -100: {
        navigate('../device-register');
        return;
      }

      case -101: {
        setForced(true);
        break;
      }
      }

      setError(t(`login.status.login.${response.content}`));
    } catch (e) {
      setError(t(`login.generic_error`));
      console.error(e);
    }
  };

  return (
    <form class={styles.loginForm} onSubmit={onLogin}>
      <Show when={typeof error() === 'string'}>
        <div class={styles.error}>
          {/* TODO: replace to warning icon */}
          <div class={styles.errorIcon}>
            !
          </div>
          {error()}
        </div>
      </Show>
      <Input ref={loginInput} icon={<IconUser />} placeholder={t('login.id_placeholder')} />
      <Input
        ref={passwordInput}
        type={'password'}
        icon={<IconKey />}
        placeholder={t('login.password_placeholder')}
      />
      <Button>
        {t('login.login')}
      </Button>
    </form>
  );
};
