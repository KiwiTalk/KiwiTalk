import { Show, mergeProps } from 'solid-js';
import { useTransContext } from '@jellybrick/solid-i18next';

import ChatImage from './image';
import { styled } from '../../../utils';
import {
  container,
  count,
  message,
  state,
  stateIcon,
  time,
  title,
  unread,
  imageContainer,
} from './index.css';

import type { ChatItemProps } from './types';

import Mute from './icons/mute.svg';
import Pin from './icons/pin.svg';
import Forum from './icons/forum.svg';

const defaultChatItemProps: Partial<ChatItemProps> = {
  unread: 0,
  isDM: false,
  isPinned: false,
  isForum: false,
  isMuted: false,
};

const Container = styled('div', container);
const ImageContainer = styled('div', imageContainer);
const Title = styled('div', title);
const Message = styled('div', message);
const Time = styled('div', time);
const State = styled('div', state);
const StateIcon = styled('div', stateIcon);
const Unread = styled('div', unread);
const Count = styled('div', count);

const ChatItem = (props: ChatItemProps) => {
  const local = mergeProps(defaultChatItemProps, props);

  const [, { getI18next }] = useTransContext();

  const toTime = (date: Date): string => {
    return new Intl.DateTimeFormat(getI18next().language).format(date);
  };

  return (
    <Container>
      <ImageContainer>
        <ChatImage
          thumbnail={local.thumbnail}
          avatars={local.avatars}
          unread={local.unread}
        />
      </ImageContainer>
      <Title>
        <Show when={local.isForum}>
          <StateIcon>
            <Forum />
          </StateIcon>
        </Show>
        {local.name}
        <Show when={!local.isDM}>
          <Count>
            {local.memberCount}
          </Count>
        </Show>
      </Title>
      <Message>
        <Show when={local.unread}>
          <Unread>
            {Math.min(300, local.unread!)}
            {local.unread! > 300 ? '+' : ''}
          </Unread>
        </Show>
        {local.lastMessage}
      </Message>
      <Time>
        {local.lastUpdateTime ? toTime(local.lastUpdateTime) : ''}
      </Time>
      <State>
        <Show when={local.isPinned}>
          <StateIcon>
            <Pin />
          </StateIcon>
        </Show>
        <Show when={local.isMuted}>
          <StateIcon>
            <Mute />
          </StateIcon>
        </Show>
      </State>
    </Container>
  );
};

export type { ChatItemProps };
export default ChatItem;
