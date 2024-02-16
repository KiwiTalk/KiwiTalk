import { Chatlog } from '@/api/client';

export type PendingChatlog = {
  senderId: string;

  status: 'pending' | 'rejected';

  chatType: number;

  content?: string;
  attachment?: string;
  supplement?: string;

  referer?: number;
};

export type ChatlogBase = Chatlog | PendingChatlog;

export function isPendingChatlog(
  chatlog: ChatlogBase,
): chatlog is PendingChatlog {
  return 'status' in chatlog;
}

export function isChatlog(
  chatlog: ChatlogBase,
): chatlog is Chatlog {
  return !isPendingChatlog(chatlog);
}

