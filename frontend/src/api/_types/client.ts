import { ChannelMeta, Chatlog } from '../client';

export type ClientStatus = 'Locked' | 'Unlocked';

type Kickout = {
  type: 'kickout',
  content: { reason: number },
}
type SwitchServer = {
  type: 'switchServer',
}
type Channel = {
  type: 'channel',
  content: {
    channel: string,
    event: KiwiTalkChannelEvent,
  }
}

export type KiwiTalkEvent = Kickout | SwitchServer | Channel;

type Chat = {
  type: 'chat',
  content: Chatlog,
}
type ChatRead = {
  type: 'chatRead',
  content: {
    userId: string,
    logId: string,
  },
}
type ChatDeleted = {
  type: 'chatDeleted',
  content: Chatlog,
}
type MetaChanged = {
  type: 'metaChanged',
  content: ChannelMeta,
}
type Added = {
  type: 'added',
  content?: Chatlog,
}
type Left = {
  type: 'left'
}

export type KiwiTalkChannelEvent = Chat | ChatRead | ChatDeleted | MetaChanged | Added | Left;
