import { createEffect, createMemo, createResource, createSignal } from 'solid-js';
import { Outlet, useLocation, useMatch, useNavigate } from '@solidjs/router';
import { useTransContext } from '@jellybrick/solid-i18next';

import { defaultLoginForm } from '@/api';
import { KiwiBackground } from './_components/kiwi-background';
import { LoginStepper } from './_components/login-stepper';

import IconLock from './_assets/icons/lock.svg';
import IconPhoneLock from './_assets/icons/phone-lock.svg';
import IconLaunch from './_assets/icons/launch.svg';

import * as styles from './page.css';

export const LoginBasePage = () => {
  const [t] = useTransContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isBasePage = useMatch(() => '/login');

  const [loginData] = createResource(async () => defaultLoginForm());
  const [enableBack, setEnableBack] = createSignal(true);

  createEffect(() => {
    if (!isBasePage()) return;

    if (loginData.state === 'ready') {
      if (loginData().email) navigate('list');
      else {
        setEnableBack(false);
        navigate('login');
      }
    }
  });

  const step = () => location.pathname.match(/login\/([^/]+)$/)?.[1];
  const steps = createMemo(() => [
    {
      id: 'login',
      title: t('login.title'),
      icon: <IconLock />,
    },
    {
      id: 'device-register',
      title: t('login.register_title'),
      icon: <IconPhoneLock />,
    },
    {
      id: 'end',
      title: t('login.end_title'),
      icon: <IconLaunch />,
    },
  ]);

  return (
    <main class={styles.container}>
      <KiwiBackground />
      <section class={styles.contentContainer}>
        <div class={styles.infoContainer}>
          <LoginStepper
            enableBack={enableBack()}
            steps={steps()}
            step={step()}
            onBack={() => navigate(-1)}
          />
        </div>
        <Outlet />
      </section>
    </main>
  );
};
