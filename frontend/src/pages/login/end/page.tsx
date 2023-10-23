import { Trans } from '@jellybrick/solid-i18next';

import { Button } from '@/ui-common/button';

import * as styles from './page.css';
import { useLocation, useNavigate } from '@solidjs/router';
import { loginWithResult } from '@/api';

export const LoginEndPage = () => {
  const navigate = useNavigate();
  const location = useLocation<{ email?: string; password?: string; }>();
  const input = () => location.state;

  const onStart = async () => {
    const result = await loginWithResult({
      email: input()?.email ?? '',
      password: input()?.password ?? '',
      saveEmail: true,
      autoLogin: false,
    });

    if (result.type === 'Success') navigate('/main');
    else navigate('/login');
  };

  return (
    <div class={styles.container}>
      <h1 class={styles.title}>
        <Trans key={'login.end_caption_title'} />
      </h1>
      <span class={styles.subtitle}>
        <Trans key={'login.end_caption_subtitle'} />
      </span>
      <Button onClick={onStart}>
        <Trans key={'login.start'} />
      </Button>
    </div>
  );
};
