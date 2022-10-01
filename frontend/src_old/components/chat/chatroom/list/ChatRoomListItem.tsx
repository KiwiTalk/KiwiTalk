import React, { HTMLAttributes } from 'react';

import styled from 'styled-components';

import color from '../../../../assets/colors/theme';
import ProfileImage from '../../../common/ProfileImage';

const Wrapper = styled.div`
  padding: 12px;
  box-sizing: border-box;
  cursor: pointer;

  transition: all 0.25s;

  :hover {
    background: ${color.GREY_700};
  }
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
  font-family: KoPubWorldDotum, sans-serif;
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
  font-family: KoPubWorldDotum, sans-serif;
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

interface ProfileImageSetProps extends HTMLAttributes<HTMLDivElement> {
  urls: string[]
}

const ProfileImageSet: React.FC<ProfileImageSetProps> = ({
  urls,
}) => {
  const size = urls.length <= 1 ? 54 : 24;

  const setPosition = (i: number) => {
    const model = {
      gridArea: '1 / 1 / span 1 / span 1',
    };

    switch (urls.length) {
      case 2:
        model.gridArea = `${i} / ${i} / span 1 / span 1`;
        return model;
      case 3:
        model.gridArea = `${
          Math.ceil((i + 2) / 3)
        } / ${
          i === 1 ? 2 : i === 2 ? 1 : 3
        } / span 1 / span 2`;
        return model;
      case 4:
        model.gridArea = `${
          i < 2 ? 1 : 2
        } / ${
          i < 2 ? i : i - 2
        } / span 1 / span 1`;
        return model;
    }
  };

  const list = urls.map((e, i) => {
    return (
      <ProfileImage
        key={i}
        src={e}
        style={{ width: size, height: size, ...setPosition(i + 1) }}/>
    );
  });

  return <div style={{ display: 'grid', gridGap: '3px' }}>{list}</div>;
};

interface ChatListItemProps extends HTMLAttributes<HTMLDivElement> {
  profileImageSrcArr: string[]
  username: string
  lastChat: string
  selected: boolean
}

const ChatRoomListItem: React.FC<ChatListItemProps> = ({
  profileImageSrcArr,
  username,
  lastChat,
  selected,
  ...args
}) => (
  <Wrapper
    {...args}
    style={
      selected ?
        { background: color.GREY_700 } :
        {}
    }>
    <Content>
      <ProfileImageSet urls={profileImageSrcArr}/>
      <Text>
        <Username>{username}</Username>
        <LastChat>{lastChat || '\u200b'}</LastChat>
      </Text>
    </Content>
  </Wrapper>
);

export default ChatRoomListItem;
