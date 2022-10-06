import { FormEvent } from 'react';
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
  defaultInput?: Partial<LoginFormInput>,
  onSubmit?: (input: LoginFormInput) => void,

  className?: string
}

export const LoginForm = ({
  defaultInput,
  onSubmit,

  className,
}: LoginFormProp) => {
  const { t } = useTranslation();

  function submitHandler(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const input: LoginFormInput = {
      email: formData.get('email')?.valueOf() as string ?? '',
      password: formData.get('password')?.valueOf() as string ?? '',
      saveId: formData.get('save_id')?.valueOf() as boolean ?? false,
      autoLogin: formData.get('auto_login')?.valueOf() as boolean ?? false,
    };

    if (input.email === '' || input.password === '') return;

    onSubmit?.(input);
  }

  return <form className={className} onSubmit={submitHandler}>
    <LoginInput
      name='email'
      icon={<AccountCircleSvg />}
      placeholder={t('login.id_placeholder')}
      defaultValue={defaultInput?.email}
    />
    <LoginInput
      name='password'
      icon={<VpnKeySvg />}
      type='password'
      placeholder={t('login.password_placeholder')}
      defaultValue={defaultInput?.password}
    />
    <LoginButton>{t('login.login')}</LoginButton>
    <LoginCheckbox
      name='save_id'
      status={{ checked: defaultInput?.saveId }}
    >{t('login.save_id')}</LoginCheckbox>
    <LoginCheckbox
      name='auto_login'
      status={{ checked: defaultInput?.autoLogin }}
    >{t('login.auto_login_on_launch')}</LoginCheckbox>
  </form>;
};
