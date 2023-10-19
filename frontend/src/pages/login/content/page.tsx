import { useTransContext } from '@jellybrick/solid-i18next';

import { Button } from '@/ui-common/button';
import { Input } from '@/ui-common/input';

import * as styles from './page.css';

import IconUser from '@/assets/icons/user.svg';
import IconKey from '../_assets/icons/key.svg';

export const LoginContentPage = () => {
  const [t] = useTransContext();

  return (
    <form class={styles.loginForm}>
      <Input icon={<IconUser />} placeholder={t('login.id_placeholder')} />
      <Input
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
