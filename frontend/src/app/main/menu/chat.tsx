import { useTransContext } from '@jellybrick/solid-i18next';
import { AppSideMenu, SideButton } from '.';
import { SideMenuGroupList } from '../../../components/side-menu/group-list';
import ChatOutlineSvg from './icons/chat_outline.svg';
import ForumOutlineSvg from './icons/forum_outline.svg';
import SearchSvg from './icons/search.svg';
import NewChatSvg from './icons/new_chat.svg';

export const ChatMenu = () => {
  const [t] = useTransContext();

  // See https://github.com/i18next/react-i18next/issues/1571
  const normalChat: string = t('main.menu.chat.normal_chat');
  const openChat: string = t('main.menu.chat.open_chat');

  return <AppSideMenu
    name={t('main.menu.chat.name')}
    headContents={
      <>
        <SideButton type='button'>
          <SearchSvg />
        </SideButton>
        <SideButton type='button'>
          <NewChatSvg />
        </SideButton>
      </>
    }>
    <SideMenuGroupList icon={<ChatOutlineSvg />} name={normalChat} defaultExpanded={true}>
    </SideMenuGroupList>
    <SideMenuGroupList icon={<ForumOutlineSvg />} name={openChat} defaultExpanded={true}>
    </SideMenuGroupList>
  </AppSideMenu>;
};
