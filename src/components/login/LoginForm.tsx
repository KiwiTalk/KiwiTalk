import React, { ChangeEvent, FormEvent, MouseEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';

import AccountCircle from '../../assets/images/account_circle.svg';
import AccountCircleDisabled from '../../assets/images/account_circle_disabled.svg';
import VPNKey from '../../assets/images/vpn_key.svg';
import VPNKeyDisabled from '../../assets/images/vpn_key_disabled.svg';

import Strings from '../../constants/Strings';
import { ReducerType } from '../../reducers';
import { setLoginOption, setPassword } from '../../reducers/auth';
import { setEmail } from '../../utils/auto-login';
import { Button } from '../common/button';

import CheckBox from '../common/check-box';
import Input from '../common/input';

const Form = styled.form`
  width: 280px;
  margin-bottom: 50px;
`;

export interface LoginFormProps {
  onSubmit: (force?: boolean, token?: boolean) => Promise<void>;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const auth = useSelector((state: ReducerType) => state.auth);

  /*
  // TODO: FIX
  useEffect(() => {
    (async () => {
      const autoLogin = await UtilModules.login.isAutoLogin();
      const email = await UtilModules.login.getEmail();
      const saveEmail = !!email;

      setForm({ email, autoLogin, saveEmail, password: '' });
    })();
  }, []);
*/
  const onChange = (key: string) => ({ target }: ChangeEvent<HTMLInputElement>) => {
    switch (key) {
      case 'email':
        dispatch(setEmail(target.value));
        break;
      case 'password':
        dispatch(setPassword(target.value));
        break;
    }
  };

  const onOptionChange = (key: string) => () => {
    switch (key) {
      case 'saveEmail':
        dispatch(setLoginOption({
          saveEmail: !auth.saveEmail,
        }));
        break;
      case 'authLogin':
        dispatch(setLoginOption({
          autoLogin: !auth.autoLogin,
        }));
        break;
    }
  };

  const onFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <Form onSubmit={onFormSubmit}>
      <Input
        placeholder={Strings.Auth.KAKAO_ACCOUNT}
        icon={AccountCircle}
        disabledIcon={AccountCircleDisabled}
        name={'email'}
        value={auth.email}
        onChange={onChange('email')}/>
      <Input
        placeholder={Strings.Auth.PASSWORD}
        type={'password'}
        icon={VPNKey}
        disabledIcon={VPNKeyDisabled}
        name={'password'}
        value={auth.password}
        onChange={onChange('password')}/>
      <Button style={{ marginTop: '12px' }}>
        {Strings.Auth.LOGIN}
      </Button>
      <CheckBox
        style={{ marginTop: '10px' }}
        checked={auth.saveEmail}
        label={Strings.Auth.SAVE_ID}
        onClick={onOptionChange('saveEmail')}/>
      <CheckBox
        style={{ marginTop: '10px' }}
        checked={auth.autoLogin}
        label={Strings.Auth.USE_AUTO_LOGIN}
        onClick={onOptionChange('authLogin')}/>
    </Form>
  );
};

export default LoginForm;
