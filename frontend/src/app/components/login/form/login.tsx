import { Button } from '../../../../components/button';
import { CheckBox } from '../../../../components/check-box';
import { InputForm } from '../../../../components/input-form';
import { useTransContext } from '@jellybrick/solid-i18next';

import AccountCircleSvg from './icons/account_circle.svg';
import VpnKeySvg from './icons/vpn_key.svg';
import { styled } from '../../../../utils';
import { loginButton, loginCheckbox, loginInput } from './login.css';
import { JSX } from 'solid-js/jsx-runtime';


const LoginInput = styled(InputForm, loginInput);
const LoginButton = styled(Button, loginButton);
const LoginCheckbox = styled(CheckBox, loginCheckbox);

export type LoginFormInput = {
  email: string,
  password: string,
  saveId: boolean,
  autoLogin: boolean
}

export type LoginFormProp = {
  input?: Partial<LoginFormInput>,
  onSubmit?: (input: LoginFormInput) => void,

  class?: string
}

export const LoginForm = (props: LoginFormProp) => {
  const [t] = useTransContext();

  const submitHandler: JSX.EventHandlerUnion<HTMLFormElement, Event> = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const input: LoginFormInput = {
      email: formData.get('email')?.valueOf() as string ?? '',
      password: formData.get('password')?.valueOf() as string ?? '',
      saveId: !!formData.get('save_id')?.valueOf(),
      autoLogin: !!formData.get('auto_login')?.valueOf(),
    };

    if (input.email === '' || input.password === '') return;

    props.onSubmit?.(input);
  };

  return <form class={props.class} onSubmit={submitHandler}>
    <LoginInput
      name='email'
      icon={<AccountCircleSvg />}
      placeholder={t('login.id_placeholder')}
      value={props.input?.email}
    />
    <LoginInput
      name='password'
      icon={<VpnKeySvg />}
      type='password'
      placeholder={t('login.password_placeholder')}
      value={props.input?.password}
    />
    <LoginButton>{t('login.login')}</LoginButton>
    <LoginCheckbox
      name='save_id'
      status={{ checked: props.input?.saveId }}
    >{t('login.save_id')}</LoginCheckbox>
    <LoginCheckbox
      name='auto_login'
      status={{ checked: props.input?.autoLogin }}
    >{t('login.auto_login_on_launch')}</LoginCheckbox>
  </form>;
};
