export type BaseRoomItemProps = {
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
export type ThumbnailRoomItemProps = BaseRoomItemProps & {
  thumbnail: string;
  avatars?: string[];
};
export type AvatarRoomItemProps = BaseRoomItemProps & {
  thumbnail?: string;
  avatars: string[];
};

export type RoomItemProps = ThumbnailRoomItemProps | AvatarRoomItemProps;
