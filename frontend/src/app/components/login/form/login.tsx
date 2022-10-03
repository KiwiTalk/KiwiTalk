import { useRef } from 'react';
import styled from 'styled-components';
import { Button } from '../../../../components/button';
import { CheckBox } from '../../../../components/check-box';
import { InputForm } from '../../../../components/input-form';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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

  return <form className={className} onSubmit={(e) => e.preventDefault()}>
    <LoginInput
      icon={<AccountCircleSvg />}
      placeholder={t('login.id_placeholder')}
      defaultValue={inputRef.current.email}
      onInput={(text) => inputRef.current.email = text}
    />
    <LoginInput
      icon={<VpnKeySvg />}
      type='password'
      placeholder={t('login.password_placeholder')}
      defaultValue={inputRef.current.password}
      onInput={(text) => inputRef.current.password = text}
    />
    <LoginButton onClick={() => clickHandler()}>{t('login.login')}</LoginButton>
    <LoginCheckbox
      id='saveId'
      status={{ checked: inputRef.current.saveId }}
      onInput={(status) => inputRef.current.saveId = status.checked}
    >{t('login.save_id')}</LoginCheckbox>
    <LoginCheckbox
      id='autoLogin'
      status={{ checked: inputRef.current.autoLogin }}
      onInput={(status) => inputRef.current.autoLogin = status.checked}
    >{t('login.auto_login_on_launch')}</LoginCheckbox>
  </form>;
};
