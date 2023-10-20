import { Button } from '@/ui-common/button';
import { LoginCard } from './_components/card';
import * as styles from './page.css';
import { Trans } from '@jellybrick/solid-i18next';
import { defaultLoginForm } from '@/api';
import { createResource } from 'solid-js';
import { useNavigate } from '@solidjs/router';

export const LoginListPage = () => {
  const navigate = useNavigate();
  const [loginData] = createResource(async () => defaultLoginForm());

  const onAddAccount = () => {
    navigate('../login');
  };

  return (
    <ul class={styles.container}>
      <div>
        <span class={styles.title.normal}>Kiwi</span>
        <span class={styles.title.bold}>Talk</span>
      </div>
      <LoginCard
        name={loginData()?.email}
        email={loginData()?.email}
      />
      <div class={styles.tool}>
        <Button variant={'text'}>
          <Trans key={'login.manage_account'} />
        </Button>
        <Button variant={'text'} onClick={onAddAccount}>
          <Trans key={'login.add_account'} />
        </Button>
      </div>
    </ul>
  );
};
