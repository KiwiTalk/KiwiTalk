import React, {EventHandler, FormEvent, useState} from 'react';
import styled from 'styled-components';

import Color from '../../assets/javascripts/color';
import background from "../../assets/images/background.svg";

import LoginTitle from './LoginTitle';

const Wrapper = styled.div`
width: 100%;
height: 100%;
background: url(${background}) no-repeat left top fixed;
position: fixed;
z-index: 1;
padding: 75px 0 0 50px;
animation: slide 3s;

@media screen and (max-width: 1280px) {
background-size: 1280px 720px;
}

@media screen and (max-width: 560px) {
padding: 0;
display: flex;
flex-direction: column;
justify-content: center;
align-items: center;
}

@keyframes slide {
from {
background-position: -100vw -100vh;
}
to {
background-position: 0 0;
}
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

:focus {
outline:none;
}
`;

const Form = styled.form`
width: 300px;
margin-bottom: 50px;
`;

const Input: React.FC<{placeholder: string, type?: string, icon: string}> = ({placeholder, type, icon}) => {
  const [focus, setFocus] = useState(false);

  const Icon = styled.i`color: ${focus ? '#000000' : '#B3B3B3'};`;

  return (
    <InputWrapper>
      <Icon className={icon}/>
      <StyledInput placeholder={placeholder} type={type} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}/>
    </InputWrapper>
  );
};

const LoginForm: React.FC<{onSubmit: EventHandler<FormEvent>}> = ({onSubmit}) => {
  return (
    <Wrapper>
      <LoginTitle/>
      <Form onSubmit={onSubmit}>
        <Input placeholder={'카카오계정 (이메일 또는 전화번호)'} icon={'fas fa-user-circle'}/>
        <Input placeholder={'비밀번호'} type={'password'} icon={'fas fa-key'}/>
        <Button>로그인</Button>
      </Form>
    </Wrapper>
  )
};

export default LoginForm;
