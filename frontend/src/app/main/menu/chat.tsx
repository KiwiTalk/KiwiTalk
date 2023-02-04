import { useTranslation } from 'react-i18next';
import { AppSideMenu, SideButton } from '.';
import { SideMenuGroupList } from '../../../components/side-menu/group-list';
import { ReactComponent as ChatOutlineSvg } from './icons/chat_outline.svg';
import { ReactComponent as ForumOutlineSvg } from './icons/forum_outline.svg';
import { ReactComponent as SearchSvg } from './icons/search.svg';

export const ChatMenu = () => {
  const { t } = useTranslation();

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
      </>
    }>
    <SideMenuGroupList icon={<ChatOutlineSvg />} name={normalChat} defaultExpanded={true}>
    </SideMenuGroupList>
    <SideMenuGroupList icon={<ForumOutlineSvg />} name={openChat} defaultExpanded={true}>
    </SideMenuGroupList>
  </AppSideMenu>;
};
