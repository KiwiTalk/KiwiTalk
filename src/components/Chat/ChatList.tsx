import React, {EventHandler, MouseEventHandler, useEffect, useState} from 'react';
import styled from 'styled-components';
import ChatListItem from './ChatListItem';
import ProfileDefault from '../../assets/images/profile_default.svg'
import color from '../../assets/javascripts/color';
import {ChatChannel} from "node-kakao/dist";

const Wrapper = styled.div`
width: 309px;
flex: 1;
display: flex;
flex-direction: column;
background: ${color.GREY_900};
overflow-y: scroll;
::-webkit-scrollbar {
  width: 0px;
  background: transparent;
}
`;

interface ChatListProps {
  channelList: ChatChannel[]
  onChange?: (index: number) => any;
}
function extractRoomImage (channelInfo: ChatChannel['channelInfo']) {
  let imageUrl = channelInfo.roomImageURL || ProfileDefault

  channelInfo.chatmetaList.forEach((meta: any) => {
    if (meta.Type === 4) {
      const content = JSON.parse(meta.Content)
      imageUrl = content.imageUrl
    }
  })
  console.log(channelInfo);
  return imageUrl
}

const AsyncComponent: React.FC<{channel: ChatChannel, selected: boolean, onClick: MouseEventHandler}> = ({channel, selected, onClick}) => {
  const [comp, setComp] = useState<JSX.Element>();

  useEffect(() => {
    channel.getChannelInfo().then(ch => {
      console.log(ch);

      setComp(<ChatListItem
        key={ channel.Id.low }
        lastChat={ channel.LastChat ? channel.LastChat.Text : '' }
        profileImageSrc={ extractRoomImage(ch) }
        username={ ch.Name }
        selected={ selected }
        onClick={onClick}/>)
    });
  }, [])

  return (
    <React.Fragment>
      { comp }
    </React.Fragment>
  );
};

const ChatList: React.FC<ChatListProps> = ({ channelList, onChange }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
      <Wrapper>
        { channelList.map((channel, index) =>
          <AsyncComponent channel={channel} selected={selectedIndex === index} onClick={() => {
            setSelectedIndex(index);
            onChange && onChange(index);
          }}/>) }
      </Wrapper>
  );
};

export default ChatList;
