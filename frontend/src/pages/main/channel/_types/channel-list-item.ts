export type ChannelListItem = {
  id: string;
  name: string;

  displayUsers: { nickname: string; profileUrl?: string }[];

  lastChat?: {
    chatType: number;
    nickname?: string;
    content: {
      message?: string;
      attachment?: string;
      supplement?: string;
    };
    timestamp?: Date;
  };

  profile?: string;
  silent: boolean;
  unreadCount: number;
  userCount: number;
}
