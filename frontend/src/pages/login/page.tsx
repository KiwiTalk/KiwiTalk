import { useTransContext } from '@jellybrick/solid-i18next';
import { Outlet } from '@solidjs/router';

import { classes } from '@/features/theme';

import { KiwiBackground } from './_components/kiwi-background';

import IconLock from './_assets/icons/lock.svg';

import * as styles from './page.css';

export const LoginPage = () => {
  const [t] = useTransContext();

  return (
    <main class={styles.container}>
      <KiwiBackground />
      <section class={styles.contentContainer}>
        <div class={styles.infoContainer}>
          <div class={styles.iconWrapper}>
            <IconLock />
          </div>
          <h1 class={classes.typography.head1}>
            {t('login.title')}
          </h1>
        </div>
        <Outlet />
      </section>
    </main>
  );
};
