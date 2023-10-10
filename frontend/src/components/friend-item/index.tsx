import { Show } from 'solid-js';
import {
  container,
  nicknameText,
  profileImage,
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
    <div class={profileImageBox}>
      <Show when={props.profileImageUrl}>
        <img class={profileImage} src={props.profileImageUrl} />
      </Show>
    </div>
    <div class={profileNameBox}>
      <span class={nicknameText}>{props.nickname}</span>
      <Show when={props.statusMessage}>
        <span class={statusMessageText}>{props.statusMessage}</span>
      </Show>
    </div>
  </div>;
};
