import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Profile, ProfileProp } from '../components/profile';
import { Sidebar, SidebarMenuItem } from '../components/sidebar';
import { ChatMenu } from './menu/chat';
import { FriendMenu } from './menu/friend';
import { AppWindow } from './window';

export type AppMainProp = {
  defaultMenu?: SidebarMenuItem,
  profile: ProfileProp,
};

export const AppMain = ({
  defaultMenu,
  profile,
}: AppMainProp) => {
  const [menu, setMenu] = useState<SidebarMenuItem>(defaultMenu ?? 'friend');
  const { t } = useTranslation();

  const currentMenu = menu == 'friend' ? <FriendMenu /> : <ChatMenu />;

  return <AppWindow>
    <AppSidebar defaultMenu={menu} onMenuSelect={setMenu} />
    <SideMenuContainer>
      {currentMenu}
      <Profile {...profile} />
    </SideMenuContainer>
    <ChatWindowPlaceholder>{t(`main.chat.empty.${menu}`)}</ChatWindowPlaceholder>
  </AppWindow>;
};

const AppSidebar = styled(Sidebar)`
  background: #FFFFFF;
`;

const SideMenuContainer = styled.div`
  display: flex;

  flex-direction: column;

  min-width: 160px;

  width: 25%;
  height: 100%;

  background: #FFFFFF;
`;

const ChatWindowPlaceholder = styled.p`
  margin: auto auto;

  color: #4D5061;
  font-size: 0.875rem;
  text-align: center;

  user-select: none;
`;
