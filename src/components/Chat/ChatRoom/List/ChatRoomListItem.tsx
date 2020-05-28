import React, { HTMLAttributes, useState } from 'react';
import styled from 'styled-components';
import ProfileImage, { ProfileImageBackgroundColor } from '../../../Etc/ProfileImage';
import color from '../../../../assets/colors/theme';

const Wrapper = styled.div`
  width: 309px;
  height: 89px;
  padding: 14px 25px;
  box-sizing: border-box;
  cursor: pointer;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Text = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 17px;
  flex: 1;
`;

const Username = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  line-height: 25px;
  color: ${color.GREY_100};
  width: 188px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const LastChat = styled.span`
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: ${color.GREY_400};
  width: 188px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface ChatListItemProps extends HTMLAttributes<HTMLDivElement> {
  profileImageSrcs: string[]
  username: string
  lastChat: string
  selected: boolean
}

interface ProfileImageSetProps extends HTMLAttributes<HTMLDivElement> {
  urls: string[]
  backgroundColor: number
}

const ProfileImageSet: React.FC<ProfileImageSetProps> = ({ urls, backgroundColor }) => {
  let size = urls.length <= 1 ? 54 : 24;

  const setPosition = (i: number) => {
    let model = {
      gridArea: '1 / 1 / span 1 / span 1'
    }

    switch(urls.length) {
      case 2:
        model.gridArea = `${i} / ${i} / span 1 / span 1`
        return model;
      case 3:
        model.gridArea = `${Math.ceil((i + 2) / 3)} / ${i === 1 ? 2 : i === 2 ? 1 : 3} / span 1 / span 2`
        return model;
      case 4:
        model.gridArea = `${i < 2 ? 1 : 2} / ${i < 2 ? i : i - 2} / span 1 / span 1`
        return model;
    }
  }

  const list = urls.map((e, i) => {
    return <ProfileImage
      src={e}
      backgroundColor={backgroundColor}
      style={{ width: size, height: size, ...setPosition(i + 1) }} />
  })

  return <div style={{ display: 'grid', gridGap: '3px' }}>{list}</div>
}

const ChatRoomListItem: React.FC<ChatListItemProps> = ({ profileImageSrcs, username, lastChat, selected, ...args }) => {
  const [hover, setHover] = useState(false);
  return (
    <Wrapper style={hover || selected ? { backgroundColor: '#F7F7F7' } : { backgroundColor: '#FFFFFF' }}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} {...args}>
      <Content>
        <ProfileImageSet
          urls={profileImageSrcs}
          backgroundColor={hover || selected ? ProfileImageBackgroundColor.GRAY_800 : ProfileImageBackgroundColor.GRAY_900} />
        <Text>
          <Username>{username}</Username>
          <LastChat>{lastChat || '\u200b'}</LastChat>
        </Text>
      </Content>
    </Wrapper>
  );
};

export default ChatRoomListItem;
