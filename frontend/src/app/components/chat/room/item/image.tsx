import { For, Match, Switch } from 'solid-js';
import { RoomItemProps } from './types';
import { styled } from '../../../../../utils';
import { image, avatarContainer, avatar, fallback } from './image.css';

type RoomImageProps = Pick<RoomItemProps, 'avatars' | 'thumbnail'>;

const Image = styled('img', image);
const Avatar = styled('img', avatar);
const AvatarContainer = styled('div', avatarContainer);
const Fallback = styled('div', fallback);

const RoomImage = (props: RoomImageProps) => {
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

export default RoomImage;
