export type BaseChatItemProps = {
  memberCount: number;

  name: string;
  lastMessage?: string;
  lastUpdateTime?: Date;

  /* states */
  unread?: number;
  isDM?: boolean;
  isPinned?: boolean;
  isForum?: boolean;
  isMuted?: boolean;
}
export type ThumbnailChatItemProps = BaseChatItemProps & {
  thumbnail: string;
  avatars?: string[];
};
export type AvatarChatItemProps = BaseChatItemProps & {
  thumbnail?: string;
  avatars: string[];
};

export type ChatItemProps = ThumbnailChatItemProps | AvatarChatItemProps;
