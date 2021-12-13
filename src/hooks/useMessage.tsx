import { Chatlog } from 'node-kakao';
import { useState } from 'react';
import KakaoManager, { ChatEventType } from '../KakaoManager';

export function useMessage(channelId: string): Chatlog | null {
  const [state, setState] = useState<Chatlog | null>(null);

  KakaoManager.chatEvents.set(channelId, (type, chat, channel) => {
    if (type === ChatEventType.ADD) {
      if (channel.channelId.equals(channelId)) {
        setState(chat);
      }
    }
  });

  return state;
}

export default useMessage;
