import { useState } from 'react';

import { TalkChannel } from 'node-kakao';

import KakaoManager from '../KakaoManager';

export function useChannel(id: string): TalkChannel | null {
  const [state, setState] = useState<TalkChannel | null>(null);

  KakaoManager.channelEvents.set(id, (type, channel) => {
    setState(channel);
  });

  return state;
}

export default useChannel;
