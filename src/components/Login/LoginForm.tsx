import React, {EventHandler, FormEvent, useState} from 'react';
import styled from 'styled-components';

import Color from '../../assets/javascripts/color';
import background from "../../assets/images/background.svg";
import {ReactComponent as account_circle} from '../../assets/images/account_circle.svg';
import {ReactComponent as vpn_key} from '../../assets/images/vpn_key.svg';

import LoginTitle from './LoginTitle';

const Wrapper = styled.div`
width: 100%;
height: 100%;
background: url(${background}) no-repeat left top fixed;

display: flex;
flex-direction: column;
justify-content: center;
position: fixed;
z-index: 1;

@media screen and (max-width: 1280px) {
background-size: 1280px 720px;
}
`;

const StyledInput = styled.input`
width: 100%;
height: 100%;
border: none;
margin-left: 10px;
padding: 0;
background: none;

:focus {
outline: none;
}

::placeholder {
font-size: 12px;
color: rgba(0, 0, 0, 0.3);
}

`;

const InputWrapper = styled.div`
width: 100%;
height: 50px;
display: flex;
align-items: center;
margin-bottom: 20px;
border-radius: 10px;
box-sizing: border-box;
padding: 10px;
background: #FFFFFF;
box-shadow: 0 4px 20px rgba(26, 60, 68, 0.07);
`;

const Button = styled.button`
width: 100%;
height: 50px;
border: none;
margin-top: 10px;
background: ${Color.BUTTON};
color: #FFFFFF;
border-radius: 10px;
font-weight: 600;

:hover {
background: ${Color.BUTTON_HOVER};
}
`;

const Form = styled.form`
width: 300px;
margin: 50px 0 0 50px;
`;

const Input: React.FC<{placeholder: string, type?: string, icon: React.FunctionComponent}> = ({placeholder, type, icon}) => {
  const [focus, setFocus] = useState(false);

  const Icon = styled(icon)`#icon {fill: ${(props: { isFocus: boolean }) => props.isFocus ? '#000000' : '#B3B3B3'};}`;

  return (
    <InputWrapper>
      {icon && <Icon isFocus={focus}/>}
      <StyledInput placeholder={placeholder} type={type} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}/>
    </InputWrapper>
  );
};

const LoginForm: React.FC<{onSubmit: EventHandler<FormEvent>}> = ({onSubmit}) => {
  return (
    <Wrapper>
      <LoginTitle/>
      <Form onSubmit={onSubmit}>
        <Input placeholder={'카카오계정 (이메일 또는 전화번호)'} icon={account_circle}/>
        <Input placeholder={'비밀번호'} type={'password'} icon={vpn_key}/>
        <Button>로그인</Button>
      </Form>
    </Wrapper>
  )
};

export default LoginForm;
