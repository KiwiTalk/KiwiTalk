import { ChatChannel } from 'node-kakao';
import React, { MouseEventHandler, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import color from '../../../../assets/colors/theme';
import useChannel from '../../../../hooks/useChannel';
import KakaoManager from '../../../../KakaoManager';
import { ReducerType } from '../../../../reducers';
import { selectChannel } from '../../../../reducers/chat';
import { extractRoomImage, extractRoomName } from '../../utils/RoomInfoExtractor';
import ChatRoomListItem from './ChatRoomListItem';

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

const ChatRoomList: React.FC = () => {
  const dispatch = useDispatch();
  const { select } = useSelector((state: ReducerType) => state.chat);

  useChannel('update-channel');

  const onClick = (id: string) => () => {
    dispatch(selectChannel(id));
  };

  return (
    <Wrapper>
      {
        KakaoManager.channelList.map((channel) => (
          <AsyncComponent
            key={`channel-${channel.Id.toString()}`}
            channel={channel}
            selected={channel.Id.equals(select)}
            onClick={onClick(channel.Id.toString())}/>
        ))
      }
    </Wrapper>
  );
};

export default ChatRoomList;
