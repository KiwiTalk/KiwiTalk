import { useTransContext } from '@jellybrick/solid-i18next';

import { Button } from '@/ui-common/button';
import { Input } from '@/ui-common/input';

import * as styles from './page.css';

import IconUser from '@/assets/icons/user.svg';
import IconKey from '../_assets/icons/key.svg';
import { createEffect, createSignal } from 'solid-js';
import { loginWithResult } from '@/api';
import { useNavigate, useRouteData } from '@solidjs/router';
import { ErrorTip } from '../_components/error-tip';

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

    const result = await loginWithResult({
      email: loginInput.value,
      password: passwordInput.value,
      saveEmail: true, // input.saveId,
      autoLogin: false, // input.autoLogin,
    }, forced());

    if (result.type === 'Success') {
      refreshLoginState();
      navigate('/');
    } else if (result.type === 'NeedRegister') {
      navigate('../device-register', {
        state: {
          email: loginInput.value,
          password: passwordInput.value,
        },
      });
    } else {
      if (result.forced) setForced(true);

      setError(t(result.key));
    }
  };

  return (
    <form class={styles.loginForm} onSubmit={onLogin}>
      <ErrorTip message={error()} />
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
