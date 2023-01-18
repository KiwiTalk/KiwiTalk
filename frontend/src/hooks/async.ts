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
    let canceled = false;

    (async () => {
      if (status.status !== 'pending') {
        setStatus({ status: 'pending' });
      }

      try {
        const value = await asyncFn();

        if (canceled) return;
        setStatus({
          status: 'resolved',
          value,
        });
      } catch (error) {
        if (canceled) return;
        setStatus({
          status: 'error',
          error,
        });
      }
    })().then();

    return () => {
      canceled = true;
    };
  }, deps);

  return status;
}
