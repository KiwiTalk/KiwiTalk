import { OpenMemberStruct, ChannelType, ChannelMetaStruct, UserInfo, OpenMemberType, TalkClient, ChatAttachment, MentionContentList } from "node-kakao";

export interface Long {
  low: number
  high: number
  unsigned: boolean
}

export interface ChannelInfo {
  channel: ChatChannel;
  roomType: ChannelType;
  lastInfoUpdated: number;
  roomImageURL: string;
  roomFullImageURL: string;
  name: string;
  isFavorite: boolean;
  isDirectChan: boolean;
  chatmetaList: ChannelMetaStruct[];
  userInfoMap: Map<string, UserInfo>;
  clientUserInfo: UserInfo;
}

export interface OpenChannelInfo extends ChannelInfo {
  channel: OpenChatChannel;
  linkInfo: { CoverURL: string, LinkURL: string, Owner: OpenMemberStruct };
  memberTypeMap: Map<string, OpenMemberType>;
}

export interface ChatChannel {
  client: TalkClient;
  id: Long;
  type: ChannelType;
  lastChat: Chat | null;
  readonly channelInfo: ChannelInfo;
}

export interface OpenChatChannel extends ChatChannel {
  linkId: Long;
  openToken: number;
}

export interface Chat {
  prevLogId: Long;
  logId: Long;
  channel: ChatChannel;
  sender: ChatUser;
  messageId: number;
  text: string;
  attachmentList: ChatAttachment[];
  mentionMap: Map<string, MentionContentList>;
  sendTime: number;
}

export interface ChatUser {
  client: TalkClient;
  id: Long;
  nickname: string;
}

export interface ClientChatUser extends ChatUser {
  mainOpenToken: number;
  mainUserInfo: ClientUserInfo;
}

export interface ClientUserInfo {
  clientAccessData: {
    Status: number,
    CountryISO: string,
    CountryCode: string,
    AccountId: number,
    LogonServerTime: number,
    AccessToken: string,
    RefreshToken: string,
    TokenType: string,
    AutoLoginEmail: string,
    DisplayAccountId: string,
    StoryURL: string,
    MainDevice: string,
    MainDeviceAppVersion: string
  };
  settings: { 
    ProfileImageURL: string,
    FullProfileImageURL: string,
    OriginalProfileImageURL: string,
    BackgroundImageURL: string,
    OriginalBackgroundImageURL: string
  }
}