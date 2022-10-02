import { IconButton } from '@material-ui/core';
import { Close, Reply } from '@material-ui/icons';
import React, { ChangeEvent, FormEvent, useContext, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ChatResultType, sendChat } from '../../../actions/chat';
import { AppContext } from '../../../App';
import ThemeColor from '../../../assets/colors/theme';

import IconAttachment from '../../../assets/images/icon_attachment.svg';
import IconEmoji from '../../../assets/images/icon_emoji.svg';
import IconSend from '../../../assets/images/icon_send.svg';
import ProfileDefault from '../../../assets/images/profile_default.svg';
import KakaoManager, { ChatEventType } from '../../../KakaoManager';
import { ReducerType } from '../../../reducers';
import { clearInput, setReply } from '../../../reducers/chat';
import ProfileImage from '../../common/ProfileImage';
import { convertShortChat } from '../utils/ChatConverter';

import color from '../../../assets/colors/theme';

const Wrapper = styled.div`
  position: relative;
  z-index: 50;
`;

const Form = styled.form`
  width: 100%;
  height: 64px;
  background: ${ThemeColor.GREY_900};
  display: flex;
  position: relative;
`;

const InputWrapper = styled.div`
  display: flex;
  flex: 1;
  background: ${ThemeColor.GREY_800};
  border-radius: 9999px;
  margin: 8px;
`;

const Input = styled.input`
  background: none;
  border: none;
  width: 100%;
  padding: 8px;
  font-family: KoPubWorldDotum;
  font-style: normal;
  font-weight: 500;
  font-size: 16px;
  outline: none;

  flex: 1;
`;

const SendButton = styled(IconButton)`
  width: 36px;
  height: 36px;
  margin: 6px;
`;

const ReplyContainer = styled.div`
  position: absolute;
  top: -40px;
  left: 0;
  right: 0;

  height: 40px;
  
  display: flex;
  flex-flow: row;
  
  background: rgba(255, 255, 255, 0.7);
`;

const ReplyContent = styled.div`
  display: flex;
  flex-flow: row;
  align-items: center;
  
  flex: 1;
`;

const Author = styled.div`
  color: ${color.BLUE_300};
  
  margin-right: 4px;
`;

const ChatInput: React.FC = () => {
  const dispatch = useDispatch();
  const { input, select } = useSelector((state: ReducerType) => state.chat);
  const [text, setInputText] = useState('');
  const { talkClient } = useContext(AppContext);

  const fileRef = useRef<HTMLInputElement>(null);

  const channel = KakaoManager.getChannel(select);
  const replyChat = KakaoManager.chatList.get(select)
      ?.find(({ logId }) => logId.equals(input.reply ?? 0));

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputText(event.target.value);
  };

  const onFileClick = () => {
    fileRef.current?.click();
  };

  const removeReply = () => {
    dispatch(setReply(null));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!talkClient) return;

    const result = await sendChat(
        {
          talkClient,
          channel: KakaoManager.getChannel(select),
          chatList: KakaoManager.chatList.get(select) ?? [],
        },
        {
          text,
          files: input.files,
          reply: input.reply,
        },
    );

    if (result.type === ChatResultType.SUCCESS && result.value) {
      const chat = result.value;

      const channelId = chat.channelId.toString();
      const chatList = KakaoManager.chatList.get(channelId);

      chatList?.push(chat.chatlog);

      KakaoManager.chatEvents.forEach(
          (value) => value(ChatEventType.ADD, chat.chatlog, KakaoManager.getChannel(channelId)),
      );

      setInputText('');
      dispatch(clearInput());
    }
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>) => {
    // dispatch(addFiles(Array.from(event.target.files ?? [])));
  };

  return (
    <Wrapper>
      <ReplyContainer style={{
        visibility: input.reply ? 'visible' : 'hidden',
      }}>
        <Reply style={{ margin: 8, marginRight: 0 }}/>
        <ProfileImage
          style={{ width: 24, height: 24, margin: 8 }}
          src={
            replyChat != null ?
              channel.getUserInfo(replyChat.sender)?.fullProfileURL :
              ProfileDefault
          } />
        <ReplyContent>
          <Author>{replyChat && channel.getUserInfo(replyChat.sender)?.nickname}</Author>
          {replyChat && convertShortChat(replyChat, { size: 24 })}
        </ReplyContent>
        <IconButton onClick={removeReply}>
          <Close/>
        </IconButton>
      </ReplyContainer>
      <Form onSubmit={onSubmit}>
        <input
          ref={fileRef}
          type="file"
          style={{ visibility: 'hidden', width: 0 }}
          onChange={onFile}/>
        <InputWrapper>
          <IconButton
            style={{
              width: '36px',
              height: '36px',
              margin: '6px',
            }}
            onClick={onFileClick}>
            <img src={IconAttachment}/>
          </IconButton>
          <IconButton
            style={{
              width: '36px',
              height: '36px',
              margin: '6px 0',
            }}>
            <img src={IconEmoji}/>
          </IconButton>
          <Input onChange={onChange} value={text}/>
          <SendButton
            style={{
              margin: '6px',
            }}
            type={'submit'}>
            <img src={IconSend}/>
          </SendButton>
        </InputWrapper>
      </Form>
    </Wrapper>
  );
};

export default ChatInput;
