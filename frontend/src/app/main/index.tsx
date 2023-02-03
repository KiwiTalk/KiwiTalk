import { useState } from 'react';
import styled from 'styled-components';
import { SideMenu } from '../../components/side-menu';
import { TodoPlaceholder } from '../../components/todo-placeholder';
import { Profile, ProfileProp } from '../components/profile';
import { Sidebar, SidebarMenuItem } from '../components/sidebar';
import { AppWindow } from './window';

export type AppMainProp = {
  defaultMenu?: SidebarMenuItem,
  profile: ProfileProp,
};

export const AppMain = ({
  defaultMenu,
  profile,
}: AppMainProp) => {
  return <AppWindow>
    <AppMenu defaultMenu={defaultMenu} profile={profile} />
    <TodoPlaceholder part='ChatWindow' />
  </AppWindow>;
};

type AppMenuProp = {
  defaultMenu?: SidebarMenuItem,
  profile: ProfileProp,
}

const AppMenu = ({
  defaultMenu,
  profile,
}: AppMenuProp) => {
  const [menu, setMenu] = useState<SidebarMenuItem>(defaultMenu ?? 'friend');

  return <>
    <AppSidebar defaultMenu={menu} onMenuSelect={setMenu} />
    <SideMenuContainer>
      <AppSideMenu name='TODO'></AppSideMenu>
      <Profile {...profile} />
    </SideMenuContainer>
  </>;
};

const AppSidebar = styled(Sidebar)`
  background: #FFFFFF;
`;

const AppSideMenu = styled(SideMenu)`
  background: #F2F2F3;

  border-radius: 0.5rem 0px 0px 0px;

  height: 100%;
`;

const SideMenuContainer = styled.div`
  display: flex;

  flex-direction: column;

  min-width: 160px;

  width: 25%;
  height: 100%;

  background: #FFFFFF;
`;
