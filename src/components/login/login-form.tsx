import React, {ChangeEvent, FormEvent, useEffect, useState} from 'react';
import styled from 'styled-components';

import AccountCircle from '../../assets/images/account_circle.svg';
import AccountCircleDisabled
  from '../../assets/images/account_circle_disabled.svg';
import VPNKey from '../../assets/images/vpn_key.svg';
import VPNKeyDisabled from '../../assets/images/vpn_key_disabled.svg';

import CheckBox from '../common/check-box';
import Input from '../common/input';
import UtilModules from '../../utils';
import {Button} from '../common/button';
import {LoginFormData} from '../../pages/login';

const Form = styled.form`
  width: 280px;
  margin-bottom: 50px;
`;

export type LoginHandler = (
  formData: LoginFormData
) => any;

const LoginForm: React.FC<{ onSubmit: LoginHandler }> = ({onSubmit}) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    saveEmail: false,
    autoLogin: false,
  } as LoginFormData);

  // TODO: FIX
  useEffect(() => {
    (async () => {
      const autoLogin = await UtilModules.login.isAutoLogin();
      const email = await UtilModules.login.getEmail();
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
    onSubmit(form);
    setForm({email: '', password: '', saveEmail: false, autoLogin: false});
  };

  return (
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
      <Button style={
        {
          marginTop: '12px',
        }
      }>로그인</Button>
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
  );
};

export default LoginForm;
