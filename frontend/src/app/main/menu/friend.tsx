import { useTransContext } from '@jellybrick/solid-i18next';
import { AppSideMenu, SideButton } from '.';
import { SideMenuGroupList } from '../../../components/side-menu/group-list';
import ChatOutlineSvg from './icons/chat_outline.svg';
import PeopleAltOutlineSvg from './icons/people_alt_outline.svg';
import SearchSvg from './icons/search.svg';
import PersonAddSvg from './icons/person_add.svg';

export const FriendMenu = () => {
  const [t] = useTransContext();

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
    <SideMenuGroupList
      icon={<ChatOutlineSvg />}
      name={t('main.menu.friend.channel')}
    >
    </SideMenuGroupList>
    <SideMenuGroupList
      icon={<PeopleAltOutlineSvg />}
      name={t('main.menu.friend.name')}
      defaultExpanded={true}
    >
    </SideMenuGroupList>
  </AppSideMenu>;
};
