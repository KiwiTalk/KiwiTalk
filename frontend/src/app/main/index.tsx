import { Match, Switch, createResource, createSignal } from 'solid-js';
import { Sidebar, SidebarMenuItem } from '../components/sidebar';
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
};

export type AppMainProp = {
  onLogout?: (reason: LogoutReason) => void,
};

export const AppMain = ({
  onLogout,
}: AppMainProp) => {
  const [menu, setMenu] = createSignal<SidebarMenuItem>('friend');
  const [t] = useTransContext();

  createResource(async () => {
    if (!await created()) {
      await create('Unlocked');
    }

    const stream = createMainEventStream();

    try {
      for await (const event of stream) {
        if (event.type === 'kickout') {
          onLogout?.({ type: 'Kickout', reasonId: event.content.reason });
          return;
        }

        console.log(event);
      }
    } catch (err) {
      onLogout?.({ type: 'Error', err });
    } finally {
      await destroy();
    }
  });

  return <AppWindow>
    <AppSidebar defaultMenu={menu()} onMenuSelect={setMenu} />
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
