import { Match, Switch, createResource, createSignal } from 'solid-js';
import { Profile } from '../components/profile';
import { Sidebar, SidebarMenuItem } from '../components/sidebar';
import { ChatMenu } from './menu/chat';
import { FriendMenu } from './menu/friend';
import { AppWindow } from './window';
import { styled } from '../../utils';
import { appSideBar, chatWindowPlaceholder, sideMenuContainer } from './index.css';
import { useTransContext } from '@jellybrick/solid-i18next';
import { createMainEventStream } from './event';

const AppSidebar = styled(Sidebar, appSideBar);
const SideMenuContainer = styled('div', sideMenuContainer);
const ChatWindowPlaceholder = styled('p', chatWindowPlaceholder);

export type AppMainProp = {
  onLogout?: (err?: unknown) => void,
};

export const AppMain = ({
  onLogout,
}: AppMainProp) => {
  const [menu, setMenu] = createSignal<SidebarMenuItem>('friend');
  const [t] = useTransContext();

  createResource(async () => {
    const stream = createMainEventStream();

    try {
      for await (const event of stream) {
        if (event.type === 'Kickout') {
          break;
        }

        console.log(event);
      }
    } catch (err) {
      onLogout?.(err);
      return;
    }

    onLogout?.();
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
      <Profile name='TODO' contact='example@example.com' />
    </SideMenuContainer>
    <ChatWindowPlaceholder>{t(`main.chat.empty.${menu()}`)}</ChatWindowPlaceholder>
  </AppWindow>;
};
