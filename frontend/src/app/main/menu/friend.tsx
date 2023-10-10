import { useTransContext } from '@jellybrick/solid-i18next';
import { AppSideMenu, SideButton } from '.';
import { SideMenuGroupList } from '../../../components/side-menu/group-list';
import ChatOutlineSvg from './icons/chat_outline.svg';
import PeopleAltOutlineSvg from './icons/people_alt_outline.svg';
import SearchSvg from './icons/search.svg';
import PersonAddSvg from './icons/person_add.svg';
import { For, createResource } from 'solid-js';
import { ListFriend, updateFriends } from '../../../ipc/api';
import { FriendItem } from '../../../components/friend-item';

export const FriendMenu = () => {
  const [t] = useTransContext();

  const [friends] = createResource(new Map<string, ListFriend>(), async (map) => {
    const res = await updateFriends(Array.from(map.values()).map((friend) => friend.userId));

    for (const removed of res.removedIds) {
      map.delete(removed);
    }

    for (const added of res.added) {
      map.set(added.userId, added);
    }

    return map;
  });

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
      <For each={Array.from(friends()?.values() || [])}>{
        (friend) => <FriendItem
          nickname={friend.nickname}
          profileImageUrl={friend.profileImageUrl}
          statusMessage={friend.statusMessage}
        />
      }</For>
    </SideMenuGroupList>
  </AppSideMenu>;
};
