/* users / friends */
export type UserProfile = {
  id: string;

  statusMessage: string;

  profileUrl: string;
  backgroundUrl: string;
};

export type LogonProfile = {
  nickname: string;

  uuid: string;
  uuidSearchable: boolean;

  email: string;
  emailVerified: boolean;

  pstnNumber: string;

  profile: UserProfile;
}

export type FriendProfile = {
  userId: string;

  nickname: string;

  userType: number;
  userCategory: number;

  statusMessage: string;

  profileImageUrl: string;
}

export type FriendsUpdateResult = {
  added: FriendProfile[];
  removedIds: string[];
};

/* channel / chat */
export type ChannelListItem = {
  channelType: string;

  displayUsers: {
    nickname: string;
    profileUrl?: string;
  }[],

  lastChat?: {
    chatType: number;
    timestamp: number;
    nickname?: string;
    content: {
      message?: string;
      attachment?: string;
      supplement?: string;
    },
  },

  name?: string;
  profile?: string;

  unreadCount: number;

  userCount: number;
};
