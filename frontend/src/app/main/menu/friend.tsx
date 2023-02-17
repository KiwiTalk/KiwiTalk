import { useTranslation } from 'react-i18next';
import { AppSideMenu, SideButton } from '.';
import { SideMenuGroupList } from '../../../components/side-menu/group-list';
import { ReactComponent as ChatOutlineSvg } from './icons/chat_outline.svg';
import { ReactComponent as PeopleAltOutlineSvg } from './icons/people_alt_outline.svg';
import { ReactComponent as SearchSvg } from './icons/search.svg';
import { ReactComponent as PersonAddSvg } from './icons/person_add.svg';

export const FriendMenu = () => {
  const { t } = useTranslation();

  // See https://github.com/i18next/react-i18next/issues/1571
  const friend: string = t('main.menu.friend.name');
  const channel: string = t('main.menu.friend.channel');

  return <AppSideMenu
    name={t('main.menu.friend.name')}
    headContents={
      <>
        <SideButton type='button'>
          <SearchSvg />
        </SideButton>
        <SideButton type='button'>
          <PersonAddSvg />
        </SideButton>
      </>
    }>
    <SideMenuGroupList icon={<ChatOutlineSvg />} name={channel}>
    </SideMenuGroupList>
    <SideMenuGroupList icon={<PeopleAltOutlineSvg />} name={friend} defaultExpanded={true}>
    </SideMenuGroupList>
  </AppSideMenu>;
};
