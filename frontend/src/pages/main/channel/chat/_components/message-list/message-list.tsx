import { JSX, createEffect, createRenderEffect, createSignal, on } from 'solid-js';

import { ChannelUser, Chatlog } from '@/api/client';
import { VirtualList, VirtualListRef } from '@/ui-common/virtual-list';

import * as styles from './message-list.css';
import { MessageGroup } from '../message-group';

export type MessageListProps = {
  scroller?: (ref: VirtualListRef) => void;

  channelId: string;
  messageGroups: Chatlog[][];
  members: Record<string, ChannelUser>;

  logonId?: string;
  isEnd?: boolean;

  onLoadMore?: () => void;
};
export const MessageList = (props: MessageListProps) => {
  const [isStickBottom, setIsStickBottom] = createSignal(true);

  createRenderEffect(on(() => props.channelId, () => {
    setIsStickBottom(true);
  }));

  createEffect(on(() => props.messageGroups.length, (length) => {
    if (length > 0 && isStickBottom()) {
      requestAnimationFrame(() => {
        setIsStickBottom(false);
      });
    }
  }, { defer: false }));

  let isLoaded = true;
  const onScroll: JSX.EventHandlerUnion<HTMLUListElement, Event> = (event) => {
    if (!props.isEnd && !isLoaded && event.target.scrollTop <= 0) {
      isLoaded = true;
      props.onLoadMore?.();
    }

    if (event.target.scrollTop > 0) {
      isLoaded = false;
    }
  };

  return (
    <VirtualList
      reverse
      component={'ul'}
      ref={props.scroller}
      items={props.messageGroups}
      class={styles.virtualList.outer}
      innerClass={styles.virtualList.inner}
      topMargin={32 + 64 + 16}
      bottomMargin={24 + 44 + 16}
      estimatedItemHeight={75}
      alignToBottom={isStickBottom()}
      onScroll={onScroll}
    >
      {(item) => (
        <MessageGroup
          profile={props.members[item![0].senderId]?.profileUrl}
          sender={props.members[item![0].senderId]?.nickname}
          isMine={item![0].senderId === props.logonId}
          messages={item!}
          members={Object.values(props.members)}
        />
      )}
    </VirtualList>
  );
};
