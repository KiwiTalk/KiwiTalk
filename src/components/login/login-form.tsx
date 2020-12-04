import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import styled from 'styled-components';
import Color from '../../assets/colors/theme';

import LoginTitle from './login-title';

import AccountCircle from '../../assets/images/account_circle.svg';
import AccountCircleDisabled
  from '../../assets/images/account_circle_disabled.svg';
import VPNKey from '../../assets/images/vpn_key.svg';
import VPNKeyDisabled from '../../assets/images/vpn_key_disabled.svg';

import CheckBox from '../common/check-box';
import Input from '../common/input';

const Wrapper = styled.div`
  padding: 50px 0 0 50px;

  @media screen and (max-width: 560px) {
    width: 100vw;
    height: calc(100vh - 30px);
    padding: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
`;

const Button = styled.button`
  width: 100%;
  height: 50px;
  border: none;
  margin-top: 4px;
  background: ${Color.BUTTON};
  color: #FFFFFF;
  border-radius: 10px;
  font-weight: 600;
  user-select: none;

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

export type LoginHandler = (
    email: string,
    password: string,
    saveEmail: boolean,
    autoLogin: boolean
) => any;

const LoginForm: React.FC<{ onSubmit: LoginHandler }> = ({onSubmit}) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    saveEmail: false,
    autoLogin: false,
  });

  useEffect(() => {
    (async () => {
      const autoLogin = await nw.global.login.isAutoLogin();
      const email = await nw.global.login.getEmail();
      const saveEmail = !!email;
      setForm({email, autoLogin, saveEmail, password: ''});
    })();
  }, []);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };
  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(form.email, form.password, form.saveEmail, form.autoLogin);
    setForm({email: '', password: '', saveEmail: false, autoLogin: false});
  };

  return (
    <Wrapper>
      <LoginTitle/>
      <Form onSubmit={onFormSubmit}>
        <Input placeholder={
          '카카오계정 (이메일 또는 전화번호)'
        } icon={
          AccountCircle
        } disabledIcon={
          AccountCircleDisabled
        } name={
          'email'
        } value={
          form.email
        }
        onChange={onChange}/>
        <Input placeholder={
          '비밀번호'
        } type={
          'password'
        } icon={
          VPNKey
        } disabledIcon={
          VPNKeyDisabled
        } name={
          'password'
        }
        value={form.password} onChange={onChange}/>
        <Button>로그인</Button>
        <CheckBox checked={
          form.saveEmail
        } label={
          '아이디 저장'
        } onClick={
          () => setForm({...form, saveEmail: !form.saveEmail})
        } style={
          {
            marginTop: '10px',
          }
        } />
        <CheckBox checked={
          form.autoLogin
        } label={
          '실행 시 자동 로그인'
        } onClick={
          () => setForm({...form, autoLogin: !form.autoLogin})
        } style={
          {
            marginTop: '10px',
          }
        } />
      </Form>
    </Wrapper>
  );
};

export default LoginForm;
