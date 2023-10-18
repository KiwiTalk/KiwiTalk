import { Outlet, useNavigate, useParams } from '@solidjs/router';
import { Sidebar } from './_components/sidebar';
import { container } from './page.css';
import { createMainEventStream } from '@/app/main/event';
import { logout } from '@/ipc/api';
import { created, create, destroy } from '@/ipc/client';
import { createResource } from 'solid-js';
import { LogoutReason } from '@/app/main';

export const MainPage = () => {
  const navigate = useNavigate();
  const param = useParams();

  const activeTab = () => param.tab;
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
    <main class={container}>
      <Sidebar
        collapsed={false}
        activePath={activeTab()}
        setActivePath={setActiveTab}
      />
      <Outlet />
    </main>
  )
};
