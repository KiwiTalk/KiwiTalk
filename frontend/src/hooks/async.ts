import { useState } from 'react';

export type AsyncLockHook = {
  locked: boolean,
  tryLock: (asyncFn: () => Promise<void>) => boolean
}

export function useAsyncLock(): AsyncLockHook {
  let [locked, setLocked] = useState(false);

  function tryLock(asyncFn: () => Promise<void>) {
    if (locked) return false;
    locked = true;
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
