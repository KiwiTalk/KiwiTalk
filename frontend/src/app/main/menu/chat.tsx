import { useTransContext } from '@jellybrick/solid-i18next';
import { AppSideMenu, SideButton } from '.';
import { SideMenuGroupList } from '../../../components/side-menu/group-list';
import ChatOutlineSvg from './icons/chat_outline.svg';
import ForumOutlineSvg from './icons/forum_outline.svg';
import SearchSvg from './icons/search.svg';
import NewChatSvg from './icons/new_chat.svg';
import { For, createResource } from 'solid-js';
import { ChannelListItem, getChannelList } from '../../../ipc/client';
import ChatItem from '../../../components/chat/item';

export const ChatMenu = () => {
  const [t] = useTransContext();

  // See https://github.com/i18next/react-i18next/issues/1571
  const normalChat: string = t('main.menu.chat.normal_chat');
  const openChat: string = t('main.menu.chat.open_chat');

  const [channelList] = createResource(new Map<string, ChannelListItem>(), async (map) => {
    map.clear();

    for (const [id, item] of await getChannelList()) {
      map.set(id, item);
    }

    return map;
  });

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
    <SideMenuGroupList
      itemCount={channelList()?.size ?? 0}
      icon={<ChatOutlineSvg />}
      name={normalChat}
      defaultExpanded={true}
    >
      <For each={Array.from(channelList()?.values() ?? [])}>
        {(item) => <ChatItem
          name={item.name ?? item.displayUsers.map(user => user.nickname).join(", ")}
          memberCount={item.userCount}
          avatars={item.displayUsers.reduce((list, user) => {
            if (user.profileUrl) {
              list.push(user.profileUrl);
            }

            return list;
          }, [] as string[])}
          unread={item.unreadCount}
          lastMessage={item.lastChat?.content?.message}
        />}
      </For>
    </SideMenuGroupList>
    <SideMenuGroupList
      itemCount={0}
      icon={<ForumOutlineSvg />}
      name={openChat}
      defaultExpanded={true}
    >
    </SideMenuGroupList>
  </AppSideMenu>;
};
