import { DependencyList, useEffect, useState } from 'react';

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

export type AsyncHook<T> = {
  status: 'pending'
} | {
  status: 'resolved',
  value: T
} | {
  status: 'error',
  error: unknown
};

export function useAsync<T>(asyncFn: () => Promise<T>, deps: DependencyList = []): AsyncHook<T> {
  const [status, setStatus] = useState<AsyncHook<T>>({ status: 'pending' });

  useEffect(() => {
    let cancelFn = () => { };
    const cancelPromise = new Promise<void>((resolve) => cancelFn = resolve);

    if (status.status !== 'pending') {
      setStatus({ status: 'pending' });
    }

    (async () => {
      try {
        const value = await Promise.race([asyncFn(), cancelPromise]);

        if (!value) return;
        setStatus({
          status: 'resolved',
          value,
        });
      } catch (error) {
        setStatus({
          status: 'error',
          error,
        });
      }
    })().then();

    return cancelFn;
  }, deps);

  return status;
}
