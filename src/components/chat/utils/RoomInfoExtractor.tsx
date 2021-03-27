import ProfileDefault from '../../../assets/images/profile_default.svg';
import {
  TalkChannel,
} from 'node-kakao';

export function extractRoomImage(
    channel: TalkChannel,
): string[] {
  let imageUrl: string[] = []; // [channel.info .get .RoomImageURL];
  const userList = Array.from(channel.getAllUserInfo());

  if (imageUrl.length === 0) {
    imageUrl = userList
        ?.slice(0, 4)
        ?.map((e) => e.profileURL ?? ProfileDefault) ?? [];
  }

  return imageUrl;
}

export function extractRoomName(
    channel: TalkChannel,
): string {
  let result = channel.getName();
  const userList = channel.getAllUserInfo();

  if (!result) {
    const list = [];
    for (const user of userList) {
      list.push(user.nickname);
    }

    result = list.join(', ');
  }

  return result;
}
