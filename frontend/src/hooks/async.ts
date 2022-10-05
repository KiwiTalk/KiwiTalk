import { useState } from 'react';

export type AsyncLockHook = {
  locked: boolean,
  tryLock: (promise: () => Promise<void>) => boolean
}

export function useAsyncLock(): AsyncLockHook {
  const [locked, setLocked] = useState(false);

  function tryLock(asyncFn: () => Promise<void>) {
    if (locked) return false;
    setLocked(true);

    (async () => {
      await asyncFn();
      setLocked(false);
    })().then();
    return true;
  }

  return {
    locked,
    tryLock,
  };
}
