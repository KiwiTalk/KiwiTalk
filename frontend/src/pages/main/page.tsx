import { Outlet, useLocation, useNavigate } from '@solidjs/router';

import { LogoutReason } from '@/app/main';
import { destroy } from '@/api/client';

import { Sidebar } from './_components/sidebar';

import * as styles from './page.css';
import { ReadyProvider } from './_utils/useReady';

export const MainPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <ReadyProvider onLogout={onLogout}>
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
  );
};
