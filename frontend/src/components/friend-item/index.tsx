export type FriendItemProp = {
  profileImageUrl?: string,
  nickname: string,
  statusMessage: string,
}

export const FriendItem = (props: FriendItemProp) => {
  return props.nickname;
};
