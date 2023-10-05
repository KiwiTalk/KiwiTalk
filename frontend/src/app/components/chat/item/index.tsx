import { Show, mergeProps } from 'solid-js';

import { container, count, message, state, time, title, unread, imageContainer } from './index.css';

import { styled } from '../../../../utils';
import { ChatItemProps } from './types';
import ChatImage from './image';

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
const Unread = styled('div', unread);
const Count = styled('div', count);

const ChatItem = (props: ChatItemProps) => {
  const local = mergeProps(defaultChatItemProps, props);

  return (
    <Container>
      <ImageContainer>
        <ChatImage
          thumbnail={local.thumbnail}
          avatars={local.avatars}
        />
      </ImageContainer>
      <Title>
        <Show when={local.isForum}>
          forum image
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
        {local.lastUpdateTime?.toTimeString()}
      </Time>
      <State>
        <Show when={local.isPinned}>
          pinned image
        </Show>
        <Show when={local.isMuted}>
          muted image
        </Show>
      </State>
    </Container>
  );
};

export type { ChatItemProps };
export default ChatItem;
