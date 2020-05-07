import React, {EventHandler, FormEvent} from 'react';
import account_circle from '../assets/images/account_circle.svg';
import vpn_key from '../assets/images/vpn_key.svg';
import styled from 'styled-components';

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

const Icon = styled.img`
color: #B3B3B3;
`

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
background: #1E1E1E;
color: #FFFFFF;
border-radius: 10px;
font-weight: 600;
`;

const Form = styled.form`
width: 300px;
margin: 50px 0 0 50px;
`;

const Input: React.FC<{placeholder: string, type?: string, icon?: string}> = ({placeholder, type, icon}) => (
  <InputWrapper>
    {icon && <Icon src={icon} alt={'icon'}/>}
    <StyledInput placeholder={placeholder} type={type}/>
  </InputWrapper>
);

const LoginForm: React.FC<{onSubmit: EventHandler<FormEvent>}> = ({onSubmit}) => {
  return (
    <Form onSubmit={onSubmit}>
      <Input placeholder={'카카오계정 (이메일 또는 전화번호)'} icon={account_circle}/>
      <Input placeholder={'비밀번호'} type={'password'} icon={vpn_key}/>
      <Button>로그인</Button>
    </Form>
  )
};

export default LoginForm;
