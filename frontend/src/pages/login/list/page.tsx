import { Button } from '@/ui-common/button';
import { LoginCard } from './_components/card';
import * as styles from './page.css';
import { Trans } from '@jellybrick/solid-i18next';

export const LoginListPage = () => {
  return (
    <ul class={styles.container}>
      <div>
        <span class={styles.title.normal}>Kiwi</span>
        <span class={styles.title.bold}>Talk</span>
      </div>
      <LoginCard
        profile={'https://picsum.photos/200'}
        name={'John Doe'}
        email={'john.doe' + Math.random().toString(36).substring(7) + '@example.com'}
      />
      <LoginCard
        profile={'https://picsum.photos/200'}
        name={'John Doe'}
        email={'john.doe' + Math.random().toString(36).substring(7) + '@example.com'}
      />
      <LoginCard
        profile={'https://picsum.photos/200'}
        name={'John Doe'}
        email={'john.doe' + Math.random().toString(36).substring(7) + '@example.com'}
      />
      <div class={styles.tool}>
        <Button variant={'text'}>
          <Trans key={'login.manage_account'} />
        </Button>
        <Button variant={'text'}>
          <Trans key={'login.add_account'} />
        </Button>
      </div>
    </ul>
  );
};
