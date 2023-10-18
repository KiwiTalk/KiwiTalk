import { createResource } from 'solid-js';
import { Outlet, useLocation, useNavigate } from '@solidjs/router';

import { createMainEventStream } from '@/app/main/event';
import { LogoutReason } from '@/app/main';
import { created, create, destroy } from '@/ipc/client';

import { Sidebar } from './_components/sidebar';

import * as styles from './page.css';

export const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = () => location.pathname.match(/main\/([^/]+)/)?.[1] ?? 'chat';
  console.log({ activeTab })
  const setActiveTab = (tab: string) => {
    navigate(`${tab}`, { replace: true });
  };

  let finished = false;
  createResource(async () => {
    if (!await created()) {
      await create('Unlocked');
    }

    const stream = createMainEventStream();

    try {
      for await (const event of stream) {
        if (event.type === 'kickout') {
          logout({ type: 'Kickout', reasonId: event.content.reason });
          return;
        }

        console.log(event);
      }

      if (finished) {
        return;
      }

      logout({ type: 'Disconnected' });
    } catch (err) {
      logout({ type: 'Error', err });
    }
  });

  async function logout(reason: LogoutReason) {
    if (finished) return;
    finished = true;

    try {
      navigate('/login', { resolve: false, replace: true });
      console.log('logout', reason);
    } finally {
      await destroy();
    }
  }

  return (
    <main class={styles.container}>
      <div class={styles.sidebarWrapper}>
        <Sidebar
          collapsed={false}
          activePath={activeTab()}
          setActivePath={setActiveTab}
        />
      </div>
      <Outlet />
    </main>
  )
};
