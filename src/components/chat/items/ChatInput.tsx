import { IconButton } from '@material-ui/core';
import { Chat } from 'node-kakao';
import React, { ChangeEvent, FormEvent, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { ChatResultType, sendChat } from '../../../actions/chat';
import { AppContext } from '../../../App';
import ThemeColor from '../../../assets/colors/theme';

import IconAttachment from '../../../assets/images/icon_attachment.svg';
import IconEmoji from '../../../assets/images/icon_emoji.svg';
import IconSend from '../../../assets/images/icon_send.svg';
import KakaoManager from '../../../KakaoManager';
import { ReducerType } from '../../../reducers';
import { clearInput, setText } from '../../../reducers/chat';

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

const ChatInput: React.FC = () => {
  const dispatch = useDispatch();
  const { input, select } = useSelector((state: ReducerType) => state.chat);
  const { client } = useContext(AppContext);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch(setText(event.target.value));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const result = await sendChat(
        {
          client,
          channel: KakaoManager.getChannel(select),
          chatList: KakaoManager.chatList.get(select) ?? [],
        },
        input,
    );

    if (result.type === ChatResultType.SUCCESS) {
      const chat = result.value as Chat;

      const channelId = chat.Channel.Id.toString();
      const chatList = KakaoManager.chatList.get(channelId);

      chatList?.push(chat);

      dispatch(clearInput());
    }
  };

  return (
    <Form onSubmit={onSubmit}>
      <InputWrapper>
        <IconButton
          style={{
            width: '36px',
            height: '36px',
            margin: '6px',
          }}>
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
        <Input onChange={onChange} value={input.text}/>
        <SendButton
          style={{
            margin: '6px',
          }}
          type={'submit'}>
          <img src={IconSend}/>
        </SendButton>
      </InputWrapper>
    </Form>
  );
};

export default ChatInput;
