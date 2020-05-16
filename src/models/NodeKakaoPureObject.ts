import { OpenMemberStruct, ChannelType, ChannelMetaStruct, OpenMemberType, TalkClient, ChatAttachment, MentionContentList } from "node-kakao";

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
  userInfoMap: {[id: string]: UserInfo};
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
  type: ChatType
}

export enum ChatType {
  Unknown = -1,
  Feed = 0,
  Text = 1,
  Photo = 2,
  Video = 3,
  Contact = 4,
  Audio = 5,
  DitemEmoticon = 6,
  DitemGift = 7,
  DitemImg = 8,
  KakaoLinkV1 = 9,
  Avatar = 11,
  Sticker = 12,
  Schedule = 13,
  Vote = 14,
  Lottery = 15,
  Map = 16,
  Profile = 17,
  File = 18,
  StickerAni = 20,
  Nudge = 21,
  Actioncon = 22,
  Search = 23,
  Reply = 26,
  MultiPhoto = 27,
  Mvoip = 51,
  Custom = 71,
  PlusFriend = 81,
  PlusFriendViral = 83,
  Template = 90,
  ApiTemplate = 91
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

export interface UserInfo {
  user: ChatUser;
  accountId: number;
  profileImageURL: string;
  fullProfileImageURL: string;
  originalProfileImageURL: string;
  openProfileToken?: number;
  profileLinkId?: Long;
  lastInfoCache: number;
  userType: UserType;
}

export enum UserType {
  Undefined = -999999,
  NotFriend = -100,
  Deactivated = 9,
  Friend = 100,
  OpenProfile = 1000
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