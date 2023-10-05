import { For, Match, Show, Switch } from 'solid-js';
import { ChatItemProps } from './types';
import { styled } from '../../../../utils';
import { image, avatarContainer, avatar, fallback, container, badge } from './image.css';

type ChatImageProps = Pick<ChatItemProps, 'avatars' | 'thumbnail' | 'unread'>;

const Container = styled('div', container);
const Image = styled('img', image);
const Avatar = styled('img', avatar);
const AvatarContainer = styled('div', avatarContainer);
const Fallback = styled('div', fallback);
const Badge = styled('div', badge);

const ChatImage = (props: ChatImageProps) => {
  return (
    <Container>
      <Switch fallback={<Fallback>!</Fallback>}>
        <Match when={props.thumbnail}>
          <Image src={props.thumbnail} />
        </Match>
        <Match when={props.avatars}>
          <AvatarContainer>
            <For each={props.avatars}>
              {(avatar) => <Avatar src={avatar} />}
            </For>
          </AvatarContainer>
        </Match>
      </Switch>
      <Show when={props.unread}>
        <Badge />
      </Show>
    </Container>
  );
};

export default ChatImage;
