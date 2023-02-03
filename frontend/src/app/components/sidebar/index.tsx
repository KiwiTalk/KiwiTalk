import styled from 'styled-components';
import { ReactComponent as PeopleSvg } from './icons/people.svg';
import { ReactComponent as ChatSvg } from './icons/chat.svg';
import { ReactComponent as LockSvg } from './icons/lock.svg';
import { ReactComponent as SettingsSvg } from './icons/settings.svg';
import { useState } from 'react';

export type SidebarProp = {
  className?: string
} & MenuListProp & ButtonListProp;

export const Sidebar = ({
  defaultMenu,
  className,
  onMenuSelect,
  onButtonClick,
}: SidebarProp) => {
  return <Container className={className}>
    <Inner>
      <MenuList defaultMenu={defaultMenu} onMenuSelect={onMenuSelect} />
      <BottomButtonList onButtonClick={onButtonClick} />
    </Inner>
  </Container>;
};

export type SidebarMenuItem = 'friend' | 'chat';

type MenuListProp = {
  defaultMenu: SidebarMenuItem,
  className?: string,
  onMenuSelect?: (item: SidebarMenuItem) => void,
};

const MenuList = ({
  defaultMenu,
  className,
  onMenuSelect,
}: MenuListProp) => {
  const [current, setCurrent] = useState<SidebarMenuItem>(defaultMenu);

  function createSelectionHandler(selection: SidebarMenuItem) {
    return () => {
      if (current !== selection) {
        setCurrent(selection);
        onMenuSelect?.(selection);
      }
    };
  }

  function createSelectionItem(icon: JSX.Element, item: SidebarMenuItem) {
    return <SidebarItem
      icon={icon}
      activated={current === item}
      onClick={createSelectionHandler(item)}
    />;
  }

  return <List className={className}>
    {createSelectionItem(<PeopleSvg />, 'friend')}
    {createSelectionItem(<ChatSvg />, 'chat')}
  </List>;
};

export type SidebarButtonItem = 'lock' | 'settings';

type ButtonListProp = {
  className?: string,
  onButtonClick?: (item: SidebarButtonItem) => void,
};

const ButtonList = ({
  className,
  onButtonClick,
}: ButtonListProp) => {
  function createButtonHandler(item: SidebarButtonItem) {
    return () => {
      onButtonClick?.(item);
    };
  }

  return <List className={className}>
    <SidebarItem icon={<LockSvg />} onClick={createButtonHandler('lock')} />
    <SidebarItem icon={<SettingsSvg />} onClick={createButtonHandler('settings')} />
  </List>;
};

const List = styled.ul`
  margin: 0px;

  padding: 0px;
  list-style-type: none;
`;

const BottomButtonList = styled(ButtonList)`
  margin-top: auto;
`;

const ListItem = styled.li`
  margin: 0px;

  color: #BFBDC1;

  &:hover, &[data-activated=true] {
    color: #1E2019;
  }

  transition color 0.25s;
`;

const IconButton = styled.button`
  all: unset;

  cursor: pointer;

  line-height: 0px;

  width: 1.5em;
  padding: 1.125em;
`;

const Container = styled.div`
  display: inline-block;
`;

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  
  width: 100%;
  height: 100%;
`;

type SidebarItemProp = {
  icon: JSX.Element,
  activated?: boolean,
  onClick?: () => void,
};

const SidebarItem = ({
  icon,
  activated,
  onClick,
}: SidebarItemProp) => {
  return <ListItem data-activated={activated} onClick={onClick}>
    <IconButton type='button'>
      {icon}
    </IconButton>
  </ListItem>;
};
