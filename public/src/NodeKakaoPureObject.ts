import { OpenMemberStruct, ChannelType, ChannelMetaStruct, UserInfo, OpenMemberType, TalkClient, ChatUser, ChatAttachment, MentionContentList } from "node-kakao";

export interface Long {
  max: number
  min: number
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