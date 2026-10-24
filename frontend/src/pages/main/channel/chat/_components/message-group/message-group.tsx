import {
  For,
  Match,
  Suspense,
  Switch,
  createEffect,
  createResource,
  createSignal,
  on,
} from 'solid-js';
import { Trans } from '@jellybrick/solid-i18next';

import { ChannelUser, Chatlog } from '@/api/client';
import { Profile } from '@/pages/main/_components/profile';
import { Message } from '../message/message';

import * as styles from './message-group.css';
import { useChatFactory } from '../../_hooks/useChatFactory';
import { Loader } from '@/ui-common/loader';
import { ChatlogBase, PendingChatlog, isChatlog, isPendingChatlog } from '../../_types';

const isDateDiff = (a: number, b: number) => {
  const aDate = new Date(a * 1000);
  const bDate = new Date(b * 1000);

  return (
    aDate.getFullYear() !== bDate.getFullYear() ||
    aDate.getMonth() !== bDate.getMonth() ||
    aDate.getDate() !== bDate.getDate() ||
    aDate.getHours() !== bDate.getHours() ||
    aDate.getMinutes() !== bDate.getMinutes()
  );
};

export type MessageGroupProps = {
  profile?: string;
  sender?: string;
  isMine: boolean;
  messages: ChatlogBase[];
  members: ChannelUser[];

  onRetryPending?: (pendingLog: PendingChatlog) => void;
  onCancelPending?: (pendingLog: PendingChatlog) => void;
};
export const MessageGroup = (props: MessageGroupProps) => {
  const factory = useChatFactory();

  const [isFailed, setIsFailed] = createSignal(false);

  const variant = () => props.isMine ? 'mine' : 'other';
  const isShowTime = (index: number) => {
    if (index === 0) return true;

    const current = props.messages[index];
    const next = props.messages[index + 1];

    if (!current || !next) return false;
    else if (isPendingChatlog(current) || isPendingChatlog(next)) return false;

    return isDateDiff(current.sendAt, next.sendAt);
  };
  const isBubble = (type: number) => {
    if (type === 0) return false; // feed
    if (type === 2) return false; // single image
    if (type === 6) return false; // emoticon (gif) (legacy)
    if (type === 12) return false; // emoticon
    if (type === 20) return false; // emoticon (webp)
    if (type === 25) return false; // emoticon (gif)
    if (type === 27) return false; // multiple image

    return true;
  };
  const getUnreadCount = (chat: Chatlog) => {
    const count = props.members
      .filter((user) => BigInt(user.watermark) < BigInt(chat.logId))
      .length;

    return count > 0 ? count : undefined;
  };

  let timeout: number | null = null;
  createEffect(on(() => props.sender, (sender) => {
    if (typeof timeout === 'number') clearTimeout(timeout);
    if (sender) {
      setIsFailed(false);
      return;
    }

    timeout = window.setTimeout(() => {
      setIsFailed(true);
    }, 3000);
  }));

  return (
    <div class={styles.container[variant()]}>
      <Profile src={props.profile} />
      <div class={styles.messageContainer}>
        <For each={props.messages}>
          {(message, index) => {
            const [renderer] = createResource(async () => factory()?.create(message));

            return (
              <Message
                isMine={props.isMine}
                isBubble={isBubble(message.chatType)}
                isConnected={index() !== 0}
                isRejected={isPendingChatlog(message) && message.status === 'rejected'}
                time={isChatlog(message) && isShowTime(index()) ? message.sendAt : undefined}
                unread={isChatlog(message) ? getUnreadCount(message) : undefined}
                onRetryPending={() => {
                  if (isPendingChatlog(message)) {
                    props.onRetryPending?.(message);
                  }
                }}
                onCancelPending={() => {
                  if (isPendingChatlog(message)) {
                    props.onCancelPending?.(message);
                  }
                }}
              >
                <Suspense fallback={<Loader />}>
                  {renderer()}
                </Suspense>
              </Message>
            );
          }}
        </For>
        <div class={styles.sender[variant()]}>
          <Switch fallback={<Loader />}>
            <Match when={isFailed()}>
              <Trans key={'common.unknown'} />
            </Match>
            <Match when={props.sender}>
              {props.sender}
            </Match>
          </Switch>
        </div>
      </div>
    </div>
  );
};
