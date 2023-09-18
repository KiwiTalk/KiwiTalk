import PeopleSvg from './icons/people.svg';
import ChatSvg from './icons/chat.svg';
import LockSvg from './icons/lock.svg';
import SettingsSvg from './icons/settings.svg';
import { styled } from '../../../utils';
import { bottomButtonList, container, iconButton, inner, list, listItem } from './index.css';
import { JSX } from 'solid-js/jsx-runtime';
import { createSignal } from 'solid-js';

export type SidebarButtonItem = 'lock' | 'settings';

type ButtonListProp = {
  class?: string,
  onButtonClick?: (item: SidebarButtonItem) => void,
};

const ButtonList = (props: ButtonListProp) => {
  function createButtonHandler(item: SidebarButtonItem) {
    return () => {
      props.onButtonClick?.(item);
    };
  }

  return <List class={props.class}>
    <SidebarItem icon={<LockSvg />} onClick={createButtonHandler('lock')} />
    <SidebarItem icon={<SettingsSvg />} onClick={createButtonHandler('settings')} />
  </List>;
};

const List = styled('ul', list);
const BottomButtonList = styled(ButtonList, bottomButtonList);
const ListItem = styled('li', listItem);
const IconButton = styled('button', iconButton);
const Container = styled('div', container);
const Inner = styled('div', inner);

type SidebarItemProp = {
  icon: JSX.Element,
  activated?: boolean,
  onClick?: () => void,
};

const SidebarItem = (props: SidebarItemProp) => {
  return <ListItem data-activated={props.activated} onClick={props.onClick}>
    <IconButton type='button'>
      {props.icon}
    </IconButton>
  </ListItem>;
};

export type SidebarProp = {
  class?: string
} & MenuListProp & ButtonListProp;

export const Sidebar = (props: SidebarProp) => {
  return <Container class={props.class}>
    <Inner>
      <MenuList defaultMenu={props.defaultMenu} onMenuSelect={props.onMenuSelect} />
      <BottomButtonList onButtonClick={props.onButtonClick} />
    </Inner>
  </Container>;
};

export type SidebarMenuItem = 'friend' | 'chat';

type MenuListProp = {
  defaultMenu: SidebarMenuItem,
  class?: string,
  onMenuSelect?: (item: SidebarMenuItem) => void,
};

const MenuList = (props: MenuListProp) => {
  const [current, setCurrent] = createSignal<SidebarMenuItem>(props.defaultMenu);

  function createSelectionHandler(selection: SidebarMenuItem) {
    return () => {
      if (current() !== selection) {
        setCurrent(selection);
        props.onMenuSelect?.(selection);
      }
    };
  }

  function createSelectionItem(icon: JSX.Element, item: SidebarMenuItem) {
    return <SidebarItem
      icon={icon}
      activated={current() === item}
      onClick={createSelectionHandler(item)}
    />;
  }

  return <List class={props.class}>
    {createSelectionItem(<PeopleSvg />, 'friend')}
    {createSelectionItem(<ChatSvg />, 'chat')}
  </List>;
};
