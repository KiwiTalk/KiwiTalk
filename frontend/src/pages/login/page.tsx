import { For, Show, createEffect, createMemo, createResource, createSignal } from 'solid-js';
import { Outlet, useLocation, useMatch, useNavigate } from '@solidjs/router';
import { useTransContext } from '@jellybrick/solid-i18next';

import { defaultLoginForm } from '@/api';
import { KiwiBackground } from './_components/kiwi-background';

import IconLock from './_assets/icons/lock.svg';
import IconPhoneLock from './_assets/icons/phone-lock.svg';
import IconLaunch from './_assets/icons/launch.svg';

import * as styles from './page.css';
import { Button } from '@/ui-common/button';
import { Transition, TransitionGroup } from 'solid-transition-group';
import { classes } from '@/features/theme';

export const LoginBasePage = () => {
  const [t] = useTransContext();
  const location = useLocation();
  const navigate = useNavigate();
  const isBasePage = useMatch(() => '/login');

  const [loginData] = createResource(async () => defaultLoginForm());
  const [visibleBack, setVisibleBack] = createSignal(true);

  createEffect(() => {
    if (!isBasePage()) return;

    if (loginData.state === 'ready') {
      if (loginData().email) navigate('list');
      else {
        setVisibleBack(false);
        navigate('login');
      }
    }
  });

  const step = () => location.pathname.match(/login\/([^/]+)$/)?.[1];
  const icon = createMemo(() => {
    if (step() === 'login') return <IconLock />;
    if (step() === 'device-register') return <IconPhoneLock />;
    if (step() === 'end') return <IconLaunch />;

    return null;
  });
  const titles = () => {
    if (step() === 'login') return [t('login.title')];
    if (step() === 'device-register') return [t('login.register_title'), t('login.title')];
    if (step() === 'end') {
      return [
        t('login.end_title'),
        t('login.register_title'),
        t('login.title'),
      ];
    }

    return [];
  };

  return (
    <main class={styles.container}>
      <KiwiBackground />
      <section class={styles.contentContainer}>
        <div class={styles.infoContainer}>
          <Show when={['login', 'device-register', 'end'].includes(step() ?? '')}>
            <div class={styles.iconWrapper}>
              <Transition mode={'outin'} {...classes.transition.toUp}>
                {icon()}
              </Transition>
            </div>
            <TransitionGroup {...classes.transition.toUp}>
              <For each={titles()}>
                {(title, index) => (
                  <h1 class={index() === 0 ? styles.infoTitle.main : styles.infoTitle.other}>
                    {title}
                  </h1>
                )}
              </For>
            </TransitionGroup>
            <Show when={visibleBack()}>
              <Button variant={'glass'} onClick={() => navigate(-1)} style={'margin-top: auto;'}>
                {t('common.prev')}
              </Button>
            </Show>
          </Show>
        </div>
        <Outlet />
      </section>
    </main>
  );
};
