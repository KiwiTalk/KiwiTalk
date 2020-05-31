import React, {ChangeEvent, EventHandler, FormEvent} from 'react';
import styled from 'styled-components';

import IconAttachment from '../../../assets/images/icon_attachment.svg';
import IconEmoji from '../../../assets/images/icon_emoji.svg';
import IconSend from '../../../assets/images/icon_send.svg';
import ThemeColor from '../../../assets/colors/theme';

import IconButton from '../../Etc/IconButton';


const Form = styled.form`
width: 100%;
height: 64px;
background: ${ThemeColor.GREY_900};
position: absolute;
display: flex;
bottom: 0;
left: 0;
`

const InputWrapper = styled.div`
display: flex;
flex: 1;
background: ${ThemeColor.GREY_800};
border-radius: 9999px;
margin: 12px;
`

const Input = styled.input`
background: none;
border: none;
width: 100%;
padding: 20px 64px 20px 20px;
font-family: KoPubWorldDotum;
font-style: normal;
font-weight: 500;
font-size: 16px;
outline: none;
`;

const SendButton = styled(IconButton)`
width: 24px;
height: 24px;
position: absolute;
top: 20px;
right: 38px;
`

export interface ChatInputProps {
    onChange: EventHandler<ChangeEvent<HTMLInputElement>>
    onSubmit: EventHandler<FormEvent>
    value: string
}

const ChatInput: React.FC<ChatInputProps> = ({onChange, onSubmit, value}) => {
    return (
        <Form onSubmit={onSubmit}>
            <InputWrapper>
                <IconButton background={IconAttachment} style={{
                    width: '24px',
                    height: '24px',
                    marginLeft: '9px',
                    marginRight: '6px',
                    marginTop: '8px',
                    flexShrink: 0
                }}/>
                <IconButton background={IconEmoji} style={{
                    width: '24px',
                    height: '24px',
                    marginTop: '8px',
                    flexShrink: 0}}/>
                <Input onChange={onChange} value={value}/>
                <SendButton type={'submit'} background={IconSend}/>
            </InputWrapper>
        </Form>
    )
};

export default ChatInput;