import { IconButton } from '@material-ui/core';
import React, { ChangeEvent, EventHandler, FormEvent, useContext } from 'react';
import styled from 'styled-components';
import { AppContext } from '../../../App';
import ThemeColor from '../../../assets/colors/theme';

import IconAttachment from '../../../assets/images/icon_attachment.svg';
import IconEmoji from '../../../assets/images/icon_emoji.svg';
import IconSend from '../../../assets/images/icon_send.svg';


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

export interface ChatInputProps {
  onChange: EventHandler<ChangeEvent<HTMLInputElement>>
  onSubmit: EventHandler<FormEvent>
  value: string
}

const ChatInput: React.FC<ChatInputProps> = ({ onChange, onSubmit, value }) => {
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
        <Input onChange={onChange} value={value}/>
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
