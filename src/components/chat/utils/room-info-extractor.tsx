import ProfileDefault from '../../../assets/images/profile_default.svg';
import {
  ChannelMetaStruct,
  ChannelMetaType,
  ChatChannel,
  UserInfo,
} from 'node-kakao';

export function extractRoomImage(
    channel: ChatChannel,
    userInfoList: UserInfo[],
): string[] {
  let imageUrl = [channel.RoomImageURL];

  if (!channel.RoomImageURL) {
    channel.ChannelMetaList.forEach((meta: ChannelMetaStruct) => {
      if (meta.type === ChannelMetaType.PROFILE) {
        const content = JSON.parse(meta.content);
        imageUrl = [content.imageUrl];
      }
    });

    if (!imageUrl[0]) {
      imageUrl = userInfoList
          .slice(0, 4)
          .map((e) => e.ProfileImageURL || ProfileDefault);
    }
  }

  return imageUrl;
}

export function extractRoomName(
    channel: ChatChannel,
    userInfoList: UserInfo[],
): string {
  let result = channel.Name;

  if (!result) {
    channel.ChannelMetaList.forEach((meta: ChannelMetaStruct) => {
      if (meta.type === ChannelMetaType.TITLE) {
        result = meta.content as string;
      }
    });

    if (!result) {
      result = userInfoList.map((userInfo) => userInfo.Nickname).join(', ');
    }
  }

  return result;
}
