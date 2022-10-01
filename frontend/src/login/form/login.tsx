import { useRef } from 'react';
import styled from 'styled-components';
import { Button } from '../../components/button';
import { CheckBox } from '../../components/check-box';
import { InputForm } from '../../components/input-form';

import { ReactComponent as AccountCircleSvg } from './icons/account_circle.svg';
import { ReactComponent as VpnKeySvg } from './icons/vpn_key.svg';

const LoginInput = styled(InputForm)`
  display: block;
  margin-bottom: 12px;
`;

const LoginButton = styled(Button)`
  display: block;
  margin: 12px 0px 7px 0px;
  width: 100%;
`;

const LoginCheckbox = styled(CheckBox)`
  display: block;
  margin-top: 3px;
`;

export type LoginFormInput = {
  email: string,
  password: string,
  saveId: boolean,
  autoLogin: boolean
}

export type LoginFormProp = {
  input?: Partial<LoginFormInput>,
  onSubmit?: (input: LoginFormInput) => void,

  className?: string
}

export const LoginForm = ({
  input,
  onSubmit,

  className,
}: LoginFormProp) => {
  const inputRef = useRef<LoginFormInput>({
    email: '',
    password: '',
    saveId: false,
    autoLogin: false,
    ...input,
  });

  function clickHandler() {
    if (inputRef.current.email === '' || inputRef.current.password === '') return;

    onSubmit?.(inputRef.current);
  }

  // TODO:: Update placeholder text
  return <div className={className}>
    <LoginInput
      icon={<AccountCircleSvg />}
      type='email'
      placeholder='카카오계정(이메일 또는 전화번호)'
      defaultValue={inputRef.current.email}
      onInput={(text) => inputRef.current.email = text}
    />
    <LoginInput
      icon={<VpnKeySvg />}
      type='password'
      placeholder='비밀번호'
      defaultValue={inputRef.current.password}
      onInput={(text) => inputRef.current.password = text}
    />
    <LoginButton onClick={() => clickHandler()}>로그인</LoginButton>
    <LoginCheckbox
      id='saveId'
      status={{ checked: inputRef.current.saveId }}
      onInput={(status) => inputRef.current.saveId = status.checked}
    >아이디 저장</LoginCheckbox>
    <LoginCheckbox
      id='autoLogin'
      status={{ checked: inputRef.current.autoLogin }}
      onInput={(status) => inputRef.current.autoLogin = status.checked}
    >실행 시 자동 로그인</LoginCheckbox>
  </div>;
};
