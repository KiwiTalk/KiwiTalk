import { useState } from 'react';

import { ChatChannel } from 'node-kakao';

import KakaoManager from '../KakaoManager';

export function useChannel(id: string): ChatChannel | null {
  const [state, setState] = useState<ChatChannel | null>(null);

  KakaoManager.channelEvents.set(id, (type, channel) => {
    setState(channel);
  });

  return state;
}

export default useChannel;
