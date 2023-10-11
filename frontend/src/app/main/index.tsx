import { Match, Switch, createResource, createSignal } from 'solid-js';
import { Sidebar, SidebarButtonItem, SidebarMenuItem } from '../components/sidebar';
import { ChatMenu } from './menu/chat';
import { FriendMenu } from './menu/friend';
import { AppWindow } from './window';
import { styled } from '../../utils';
import { appSideBar, chatWindowPlaceholder, sideMenuContainer } from './index.css';
import { useTransContext } from '@jellybrick/solid-i18next';
import { createMainEventStream } from './event';
import { create, created, destroy } from '../../ipc/client';
import { LogonProfile } from './profile';

const AppSidebar = styled(Sidebar, appSideBar);
const SideMenuContainer = styled('div', sideMenuContainer);
const ChatWindowPlaceholder = styled('p', chatWindowPlaceholder);

export type LogoutReason = {
  type: 'Kickout',
  reasonId: number,
} | {
  type: 'Error',
  err: unknown
} | {
  type: 'Disconnected',
} | {
  type: 'Logout',
};

export type AppMainProp = {
  onLogout?: (reason: LogoutReason) => void,
};

export const AppMain = ({
  onLogout,
}: AppMainProp) => {
  const [menu, setMenu] = createSignal<SidebarMenuItem>('friend');
  const [t] = useTransContext();

  let finished = false;

  async function logout(reason: LogoutReason) {
    if (finished) {
      return;
    }
    finished = true;

    try {
      onLogout?.(reason);
    } finally {
      await destroy();
    }
  }

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

  function onButtonClick(item: SidebarButtonItem) {
    if (item === 'lock') {
      logout({ type: 'Logout' });
    }
  }

  return <AppWindow>
    <AppSidebar defaultMenu={menu()} onMenuSelect={setMenu} onButtonClick={onButtonClick} />
    <SideMenuContainer>
      <Switch>
        <Match when={menu() == 'friend'}>
          <FriendMenu />
        </Match>
        <Match when={menu() == 'chat'}>
          <ChatMenu />
        </Match>
      </Switch>
      <LogonProfile />
    </SideMenuContainer>
    <ChatWindowPlaceholder>{t(`main.chat.empty.${menu()}`)}</ChatWindowPlaceholder>
  </AppWindow>;
};
