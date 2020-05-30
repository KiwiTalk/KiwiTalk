import ProfileDefault from '../../../../assets/images/profile_default.svg'
import { ChannelInfo, ChannelMetaStruct, ChannelMetaType, UserInfo } from 'node-kakao/dist';

export function extractRoomImage (channelInfo: ChannelInfo, userInfoList: UserInfo[]) {
  let imageUrl = [channelInfo.RoomImageURL]

  if (!channelInfo.RoomImageURL) {
      channelInfo.ChatMetaList.forEach((meta: ChannelMetaStruct) => {
          if (meta.type === ChannelMetaType.PROFILE) {
              // @ts-ignore
              const content = JSON.parse(meta.content)
              imageUrl = [content.imageUrl]
          }
      })

      if (!imageUrl[0]) {
          imageUrl = userInfoList.slice(0, 4).map(e => e.ProfileImageURL || ProfileDefault)
      }
  }

  return imageUrl
}

export function extractRoomName (channelInfo: ChannelInfo, userInfoList: UserInfo[]) {
  let result = channelInfo.Name;

  if (!result) {
      channelInfo.ChatMetaList.forEach((meta: ChannelMetaStruct) => {
          if (meta.type === ChannelMetaType.TITLE) {
              result = meta.content as string;
          }
      });

      if (!result) {
          result = userInfoList.map((userInfo) => userInfo?.User.Nickname).join(', ')
      }
  }

  return result;
} 