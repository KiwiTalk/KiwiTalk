import { Match, Switch, createSignal } from 'solid-js';
import { Profile, ProfileProp } from '../components/profile';
import { Sidebar, SidebarMenuItem } from '../components/sidebar';
import { ChatMenu } from './menu/chat';
import { FriendMenu } from './menu/friend';
import { AppWindow } from './window';
import { styled } from '../../utils';
import { appSideBar, chatWindowPlaceholder, sideMenuContainer } from './index.css';
import { useTransContext } from '@jellybrick/solid-i18next';

const AppSidebar = styled(Sidebar, appSideBar);
const SideMenuContainer = styled('div', sideMenuContainer);
const ChatWindowPlaceholder = styled('p', chatWindowPlaceholder);

export type AppMainProp = {
  onLogout?: () => void,
};

export const AppMain = ({
  onLogout
}: AppMainProp) => {
  const [menu, setMenu] = createSignal<SidebarMenuItem>('friend');
  const [t] = useTransContext();

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
