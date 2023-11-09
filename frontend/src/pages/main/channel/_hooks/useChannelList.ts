import { Accessor, createEffect, createResource, createSignal, on } from 'solid-js';

import { getChannelList, meProfile } from '@/api';
import { useReady, useChannelEvent } from '@/pages/main/_hooks';

import { ChannelListItem } from '../_types';

export const useChannelList = (): Accessor<ChannelListItem[]> => {
  const isReady = useReady();
  const event = useChannelEvent();

  const [channelList, setChannelList] = createSignal<ChannelListItem[]>([]);

  const [myProfile] = createResource(async () => meProfile());

  createEffect(on(event, (e) => {
    if (!e) return;

    const newChannelList = [...channelList().map((item) => ({ ...item }))];
    const channel = newChannelList.find((item) => item.id === e?.channelId);

    if (!channel) return;

    if (e.type === 'Chat') {
      if (e.content.senderId !== myProfile()?.profile.id) channel.unreadCount += 1;
      channel.lastChat = {
        chatType: e.content.chatType,
        content: e.content.content,
        attachment: e.content.attachment,
        timestamp: new Date(e.content.sendAt * 1000),
      };
    }
    if (e.type === 'ChatRead' && e?.content.userId === myProfile()?.profile.id) {
      channel.unreadCount = 0;
    }
    if (e.type === 'Added') channel.userCount += 1;
    if (e.type === 'Left') channel.userCount -= 1;

    setChannelList(newChannelList);
  }));

  createResource(isReady, async (ready) => {
    if (!ready) return;

    const result: ChannelListItem[] = [];

    for (const [id, item] of await getChannelList()) {
      result.push({
        id,
        name: item.name ?? item.displayUsers.map((user) => user.nickname).join(', '),
        displayUsers: item.displayUsers,
        lastChat: item.lastChat ? {
          ...item.lastChat,
          timestamp: new Date(item.lastChat.timestamp),
        } : undefined,
        userCount: item.userCount,
        unreadCount: item.unreadCount,
        profile: item.profile?.imageUrl ??
        (item.displayUsers.length === 1 ?
          item.displayUsers[0].profileUrl :
          undefined),
        silent: false, // TODO
      });
    }

    setChannelList(result);
  });

  return channelList;
};
