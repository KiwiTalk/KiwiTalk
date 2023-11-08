import { ChannelMeta, Chatlog } from '../client';

export type ClientStatus = 'Locked' | 'Unlocked';

type Kickout = {
  type: 'Kickout',
  content: { reason: number },
}
type SwitchServer = {
  type: 'SwitchServer',
}
type Channel = {
  type: 'Channel',
  content: {
    id: string,
    event: KiwiTalkChannelEvent,
  }
}

export type KiwiTalkEvent = Kickout | SwitchServer | Channel;

type Chat = {
  type: 'Chat',
  content: Chatlog,
}
type ChatRead = {
  type: 'ChatRead',
  content: {
    userId: string,
    logId: string,
  },
}
type ChatDeleted = {
  type: 'ChatDeleted',
  content: Chatlog,
}
type MetaChanged = {
  type: 'MetaChanged',
  content: ChannelMeta,
}
type Added = {
  type: 'Added',
  content?: Chatlog,
}
type Left = {
  type: 'Left'
}

export type KiwiTalkChannelEvent = Chat | ChatRead | ChatDeleted | MetaChanged | Added | Left;
