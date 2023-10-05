import { Show, mergeProps } from 'solid-js';

import { container } from './index.css';

import { styled } from '../../../../../utils';

type BaseRoomItemProps = {
  memberCount: number;

  name: string;
  lastMessage?: string;
  lastUpdateTime?: Date;

  /* states */
  unread?: number;
  isDM?: boolean;
  isPinned?: boolean;
  isForum?: boolean;
  isMuted?: boolean;
}
type ThumbnailRoomItemProps = BaseRoomItemProps & {
  thumbnail: string;
  avatars?: string[];
};
type AvatarRoomItemProps = BaseRoomItemProps & {
  thumbnail?: string;
  avatars: string[];
};

export type RoomItemProps = ThumbnailRoomItemProps | AvatarRoomItemProps;

const defaultRoomItemProps: Partial<RoomItemProps> = {
  unread: 0,
  isDM: false,
  isPinned: false,
  isForum: false,
  isMuted: false,
};

const Container = styled('div', container);

const RoomItem = (props: RoomItemProps) => {
  const local = mergeProps(defaultRoomItemProps, props);

  return (
    <Container>
      <Show
        when={local.thumbnail}
        fallback={<div>avatar image</div>}
      >
        <div>thumbnail image</div>
      </Show>
      <div>
        <Show when={local.isForum}>
          forum image
        </Show>
        {local.name}
        <Show when={!local.isDM}>
          <div>
            {local.memberCount}
          </div>
        </Show>
      </div>
      <div>
        <Show when={local.unread}>
          <div>
            {Math.max(300, local.unread!)}
            {local.unread! > 300 ? '+' : ''}
          </div>
        </Show>
        {local.lastMessage}
      </div>
      <div>
        {local.lastUpdateTime?.toString()}
      </div>
      <div>
        <Show when={local.isPinned}>
          pinned image
        </Show>
        <Show when={local.isMuted}>
          muted image
        </Show>
      </div>
    </Container>
  );
};

export default RoomItem;
