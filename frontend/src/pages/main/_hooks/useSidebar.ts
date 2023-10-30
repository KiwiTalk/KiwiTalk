import { Accessor, createSignal, createResource } from 'solid-js';
import { getChannelList } from '@/api';

export const useSidebar = (isReady: Accessor<boolean>) => {
  // FIXME create @/features/config and migrate to useConfiguration
  const [isNotificationActive, setIsNotificationActive] = createSignal(false);

  const [badges] = createResource(isReady, async (isReady) => {
    if (!isReady) {
      return {
        chat: '...',
        open: '...',
      };
    }

    let chatBadge = 0;
    let openChatBadge = 0;

    for (const [, item] of await getChannelList()) {
      // TODO: add open chat badge
      chatBadge += item.unreadCount;
      openChatBadge += 0;
    }

    return {
      chat: chatBadge,
      open: openChatBadge,
    };
  });

  return {
    badges: () => badges(),

    notificationActive: () => isNotificationActive(),
    setNotificationActive: (active: boolean) => setIsNotificationActive(active),
  };
};
