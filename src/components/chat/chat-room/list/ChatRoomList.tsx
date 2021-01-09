import { ChatChannel } from 'node-kakao';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import styled from 'styled-components';
import color from '../../../../assets/colors/theme';
import { extractRoomImage, extractRoomName } from '../../utils/room-info-extractor';
import ChatRoomListItem from './chat-room-list-item';

const Wrapper = styled.div`
  width: 309px;
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${color.GREY_900};
  overflow-y: scroll;

  ::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
`;

interface ChatListProps {
  channelList: ChatChannel[]
  onChange?: (index: number) => any;
}

interface AsyncComponentProps {
  channel: ChatChannel,
  selected: boolean,
  onClick: MouseEventHandler
}

const AsyncComponent: React.FC<AsyncComponentProps> = ({
  channel,
  selected,
  onClick,
}) => {
  const [component, setComponent] = useState<JSX.Element>(<div/>);

  useEffect(() => {
    const userInfoList = channel.getUserInfoList();

    const name = extractRoomName(channel, userInfoList);
    const profileImages = extractRoomImage(channel, userInfoList);

    setComponent(
        <ChatRoomListItem
          key={channel.Id.toString()}
          lastChat={channel.LastChat ? channel.LastChat.Text : ''}
          profileImageSrcArr={profileImages}
          username={name}
          selected={selected}
          onClick={onClick}/>,
    );
  }, [selected]);

  return component;
};

const ChatRoomList: React.FC<ChatListProps> = ({ channelList, onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);

  return (
    <Wrapper>
      {
        channelList.map((channel, index) => (
          <AsyncComponent
            key={`channel-${channel.Id.toString()}`}
            channel={channel}
            selected={selectedIndex === index}
            onClick={
              () => {
                setSelectedIndex(index);
                onChange && onChange(index);
              }
            }/>
        ))
      }
    </Wrapper>
  );
};

export default ChatRoomList;
