import { Outlet, useLocation, useNavigate } from '@solidjs/router';

import { KiwiTalkMainEvent, LogoutReason } from '@/api';
import { destroy } from '@/api/client/client';

import { Sidebar } from './_components/sidebar';

import * as styles from './page.css';
import { ReadyProvider } from './_utils/useReady';
import { EventContext } from './_utils/useEvent';
import { createSignal } from 'solid-js';

export const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [listeners, setListeners] = createSignal<((event: KiwiTalkMainEvent) => void)[]>([]);

  const activeTab = () => location.pathname.match(/main\/([^/]+)/)?.[1] ?? 'chat';
  const setActiveTab = (tab: string) => {
    navigate(`${tab}`, { replace: true });
  };

  const onLogout = async (reason: LogoutReason) => {
    try {
      navigate('/login', { resolve: false, replace: true });
      console.log('logout', reason);
    } finally {
      await destroy();
    }
  };
  const onEvent = (event: KiwiTalkMainEvent) => {
    listeners().forEach((listener) => listener(event));
  };

  return (
    <EventContext.Provider value={{
      addEvent: (listener) => {
        setListeners([...listeners(), listener]);
      },
      removeEvent: (listener) => {
        const newList = listeners().filter((l) => l !== listener);

        setListeners(newList);
      },
    }}>
      <ReadyProvider onLogout={onLogout} onEvent={onEvent}>
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
      </ReadyProvider>
    </EventContext.Provider>
  );
};
