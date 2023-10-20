import { For, Show, createEffect, createMemo, createResource } from 'solid-js';
import { Outlet, useLocation, useMatch, useNavigate } from '@solidjs/router';
import { useTransContext } from '@jellybrick/solid-i18next';

import { defaultLoginForm } from '@/api';
import { KiwiBackground } from './_components/kiwi-background';

import IconLock from './_assets/icons/lock.svg';
import IconPhoneLock from './_assets/icons/phone-lock.svg';

import * as styles from './page.css';
import { Button } from '@/ui-common/button';

export const LoginPage = () => {
  const [t] = useTransContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isBasePage = useMatch(() => '/login');

  const [loginData] = createResource(async () => defaultLoginForm());

  createEffect(() => {
    if (!isBasePage()) return;

    console.log('base page', loginData.state);
    if (loginData.state === 'ready') {
      if (loginData().saveEmail) navigate('list');
      else navigate('login');
    }
  });

  const step = () => location.pathname.match(/login\/([^/]+)$/)?.[1];
  const icon = createMemo(() => {
    if (step() === 'login') return <IconLock />;
    if (step() === 'device-register') return <IconPhoneLock />;

    return null;
  });
  const titles = () => {
    if (step() === 'login') return [t('login.title')];
    if (step() === 'device-register') return [t('login.register_title'), t('login.title')];

    return [];
  };

  return (
    <main class={styles.container}>
      <KiwiBackground />
      <section class={styles.contentContainer}>
        <div class={styles.infoContainer}>
          <Show when={['login', 'device-register'].includes(step() ?? '')}>
            <div class={styles.iconWrapper}>
              {icon()}
            </div>
            <For each={titles()}>
              {(title, index) => (
                <h1 class={index() === 0 ? styles.infoTitle.main : styles.infoTitle.other}>
                  {title}
                </h1>
              )}
            </For>
            <Button variant={'glass'} onClick={() => navigate(-1)} style={'margin-top: auto;'}>
              {t('common.prev')}
            </Button>
          </Show>
        </div>
        <Outlet />
      </section>
    </main>
  );
};
