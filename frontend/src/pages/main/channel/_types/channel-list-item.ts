export type ListProfile = {
  nickname: string;
  profileUrl?: string;
}

export type ChannelListItem = {
  id: string;
  name: string;

  displayUsers: [string, ListProfile][];

  lastChat?: {
    profile?: ListProfile,
    chatType: number;
    content?: string;
    attachment?: string;
    timestamp?: Date;
  };

  profile?: string;
  silent: boolean;
  unreadCount: number;
  userCount: number;
}
