import React, {FormEvent, useState, ChangeEvent, InputHTMLAttributes} from 'react';
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

const Icon = styled.i((props: {focus: boolean}) => `
  color: ${props.focus ? '#000000' : '#B3B3B3'};
`)

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string
  icon: string
}

const Input: React.FC<InputProps> = ({placeholder, icon, ...args}) => {
  const [focus, setFocus] = useState(false);

  return (
    <InputWrapper>
      <Icon className={icon} focus={focus}/>
      <StyledInput placeholder={placeholder} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} {...args}/>
    </InputWrapper>
  );
};

export type LoginHandler = (email: string, password: string) => any;

const LoginForm: React.FC<{onSubmit: LoginHandler}> = ({onSubmit}) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  };
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(form.email, form.password);
    setForm({ email: '', password: '' });
  };

  return (
    <Wrapper>
      <LoginTitle/>
      <Form onSubmit={onFormSubmit}>
        <Input placeholder={'카카오계정 (이메일 또는 전화번호)'} icon={'fas fa-user-circle'} name={'email'} value={form.email} onChange={onChange}/>
        <Input placeholder={'비밀번호'} type={'password'} icon={'fas fa-key'} name={'password'} value={form.password} onChange={onChange}/>
        <Button>로그인</Button>
      </Form>
    </Wrapper>
  )
};

export default LoginForm;
