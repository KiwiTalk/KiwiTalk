import { Checkbox, FormControlLabel } from '@material-ui/core';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';

import styled from 'styled-components';

import AccountCircle from '../../assets/images/account_circle.svg';
import AccountCircleDisabled from '../../assets/images/account_circle_disabled.svg';
import VPNKey from '../../assets/images/vpn_key.svg';
import VPNKeyDisabled from '../../assets/images/vpn_key_disabled.svg';

import Strings from '../../constants/Strings';

import { LoginFormData } from '../../pages/LoginPage';
import UtilModules from '../../utils';
import { Button } from '../common/button';
import CheckBox from '../common/CheckBox';
import Input from '../common/input';

const Form = styled.form`
  width: 280px;
  margin-bottom: 50px;
`;

export interface LoginFormProps {
  onSubmit: (formData: LoginFormData, force?: boolean, token?: boolean) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [saveEmail, setSaveEmail] = useState(false);
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    (async () => {
      const email = await UtilModules.login.getEmail();
      const autoLogin = await UtilModules.login.isAutoLogin();

      setEmail(email);
      setSaveEmail(!!email);
      setAutoLogin(autoLogin);
    })();
  }, []);

  const onChange = (key: string) => ({ target }: ChangeEvent<HTMLInputElement>) => {
    switch (key) {
      case 'email':
        setEmail(target.value);
        break;
      case 'password':
        setPassword(target.value);
        break;
    }
  };

  const onOptionChange = (key: string) => () => {
    switch (key) {
      case 'saveEmail':
        setSaveEmail(!saveEmail);
        break;
      case 'authLogin':
        setAutoLogin(!autoLogin);
        break;
    }
  };

  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    await onSubmit({
        email,
        password,
        saveEmail,
        autoLogin,
      },
      false,
      false,
    );
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <Input
        placeholder={Strings.Auth.KAKAO_ACCOUNT}
        icon={AccountCircle}
        disabledIcon={AccountCircleDisabled}
        name={'email'}
        value={email}
        onChange={onChange('email')}/>
      <Input
        placeholder={Strings.Auth.PASSWORD}
        type={'password'}
        icon={VPNKey}
        disabledIcon={VPNKeyDisabled}
        name={'password'}
        value={password}
        onChange={onChange('password')}/>
      <Button style={{ marginTop: '12px' }}>
        {Strings.Auth.LOGIN}
      </Button>
      <CheckBox
        style={{ marginTop: '10px' }}
        checked={saveEmail}
        label={Strings.Auth.SAVE_ID}
        onClick={onOptionChange('saveEmail')}/>
      <CheckBox
        style={{ marginTop: '10px' }}
        checked={autoLogin}
        label={Strings.Auth.USE_AUTO_LOGIN}
        onClick={onOptionChange('authLogin')}/>
    </Form>
  );
};

export default LoginForm;
