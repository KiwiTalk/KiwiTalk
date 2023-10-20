import { TransitionGroup } from 'solid-transition-group';
import { useNavigate, useRouteData } from '@solidjs/router';
import { Show, createResource, createSignal } from 'solid-js';
import { Trans, useTransContext } from '@jellybrick/solid-i18next';

import { LoginDetailForm, defaultLoginForm, loginWithResult } from '@/api';
import { classes } from '@/features/theme';

import { Button } from '@/ui-common/button';
import { Input } from '@/ui-common/input';
import { LoginCard } from './_components/card';
import { ErrorTip } from '../_components/error-tip';

import * as styles from './page.css';

import IconKey from '../_assets/icons/key.svg';

export const LoginListPage = () => {
  const [t] = useTransContext();
  const navigate = useNavigate();
  const refreshLoginState = useRouteData<() => () => void>();

  let passwordInput: HTMLInputElement | null = null;
  const [selectedLoginData, setSelectedLoginData] = createSignal<LoginDetailForm | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [forced, setForced] = createSignal(false);

  const [loginData] = createResource(async () => defaultLoginForm());

  const onAddAccount = () => {
    navigate('../login');
  };
  const onToggleLoginData = () => {
    if (selectedLoginData()) setSelectedLoginData(null);
    else setSelectedLoginData(loginData() ?? null);

    passwordInput?.focus();
  };
  const onLogin = async () => {
    const data = loginData();

    if (!data || !passwordInput?.value) {
      setError(t(`login.reason.required_id_password`));
      return;
    }

    const result = await loginWithResult({
      email: data.email,
      password: passwordInput.value,
      saveEmail: data.saveEmail,
      autoLogin: data.autoLogin,
    }, forced());

    if (result.type === 'Success') {
      refreshLoginState();
      navigate('/');
    } else if (result.type === 'NeedRegister') {
      navigate('../device-register', {
        state: {
          email: data.email,
          password: passwordInput.value,
        },
      });
    } else {
      if (result.forced) setForced(true);

      setError(t(result.key));
    }
  };

  return (
    <ul class={styles.container}>
      <div>
        <span class={styles.title.normal}>Kiwi</span>
        <span class={styles.title.bold}>Talk</span>
      </div>
      <ErrorTip message={error()} />
      <LoginCard
        profile={loginData()?.profile}
        name={loginData()?.name}
        email={loginData()?.email}
        onClick={onToggleLoginData}
      />
      <Show when={selectedLoginData()} keyed>
        <Input
          ref={(element) => passwordInput = element}
          type={'password'}
          icon={<IconKey />}
          placeholder={t('login.password_placeholder')}
        />
      </Show>
      <div class={styles.tool}>
        <TransitionGroup appear {...classes.transition.scale}>
          <Show when={!selectedLoginData()}>
            <Button variant={'text'}>
              <Trans key={'login.manage_account'} />
            </Button>
          </Show>
          <Button variant={'text'} onClick={onAddAccount}>
            <Trans key={'login.add_account'} />
          </Button>
          <Show when={!!selectedLoginData()}>
            <Button onClick={onLogin}>
              <Trans key={'login.login_name'} options={{ name: selectedLoginData()?.name }} />
            </Button>
          </Show>
        </TransitionGroup>
      </div>
    </ul>
  );
};
