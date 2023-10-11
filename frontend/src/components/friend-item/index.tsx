import { Show } from 'solid-js';
import {
  container,
  nicknameText,
  profileImageBox,
  profileNameBox,
  statusMessageText,
} from './index.css';

export type FriendItemProp = {
  profileImageUrl?: string,
  nickname: string,
  statusMessage?: string,
}

export const FriendItem = (props: FriendItemProp) => {
  return <div class={container}>
    <div
      class={profileImageBox}
      style={{ 'background-image': props.profileImageUrl ? `url(${props.profileImageUrl})` : '' }}
    />
    <div class={profileNameBox}>
      <span class={nicknameText}>{props.nickname}</span>
      <Show when={props.statusMessage}>
        <span class={statusMessageText}>{props.statusMessage}</span>
      </Show>
    </div>
  </div>;
};
