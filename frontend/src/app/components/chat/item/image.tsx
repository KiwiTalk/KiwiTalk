import { For, Match, Switch } from 'solid-js';
import { ChatItemProps } from './types';
import { styled } from '../../../../utils';
import { image, avatarContainer, avatar, fallback } from './image.css';

type ChatImageProps = Pick<ChatItemProps, 'avatars' | 'thumbnail'>;

const Image = styled('img', image);
const Avatar = styled('img', avatar);
const AvatarContainer = styled('div', avatarContainer);
const Fallback = styled('div', fallback);

const ChatImage = (props: ChatImageProps) => {
  return (
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
  );
};

export default ChatImage;
