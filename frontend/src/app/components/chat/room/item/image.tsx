import { Match, Switch } from 'solid-js';
import { RoomItemProps } from './types';
import { styled } from '../../../../../utils';
import { image } from './image.css';

type RoomImageProps = Pick<RoomItemProps, 'avatars' | 'thumbnail'>;

const Image = styled('img', image);

const RoomImage = (props: RoomImageProps) => {
  return (
    <Switch fallback={<div />}>
      <Match when={props.thumbnail}>
        <Image src={props.thumbnail} />
      </Match>
      <Match when={props.avatars}>
        <div>A</div>
      </Match>
    </Switch>
  );
};

export default RoomImage;
