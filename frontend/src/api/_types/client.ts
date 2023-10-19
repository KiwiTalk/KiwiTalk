export type ClientStatus = 'Locked' | 'Unlocked';

type KiwiTalkKickoutEvent = {
  type: 'kickout',
  content: { reason: number },
}
type KiwiTalkChatEvent = {
  type: 'chat',
  content: {
    channel: string,
    previewMessage: string,
    unreadCount: number,
  },
};
export type KiwiTalkMainEvent = KiwiTalkKickoutEvent | KiwiTalkChatEvent;
