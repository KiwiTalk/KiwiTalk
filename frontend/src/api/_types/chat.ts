/* users / friends */
export type Profile = {
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

  profile: Profile;
}

export type ListFriend = {
  userId: string;

  nickname: string;

  userType: number;
  userCategory: number;

  statusMessage: string;

  profileImageUrl: string;
}

export type FriendsUpdate = {
  added: ListFriend[];
  removedIds: string[];
};

export type ListUserProfile = {
  id: string;
  nickname: string;
  profileUrl?: string;
}

/* channel / chat */
export type ChannelListItem = {
  channelType: string;

  displayUsers: ListUserProfile[],

  lastChat?: {
    profile: ListUserProfile,
    chatType: number;
    timestamp: number;
    content?: string;
    attachment?: string;
  },

  name?: string;
  profile?: string;

  unreadCount: number;

  userCount: number;
};
