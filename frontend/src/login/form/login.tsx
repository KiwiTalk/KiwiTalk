import styled from 'styled-components';
import { Button } from '../../components/button';
import { CheckBox } from '../../components/check-box';
import { InputForm } from '../../components/input-form';

const LoginInput = styled(InputForm)`
  display: block;
  margin-bottom: 12px;
`;

const LoginButton = styled(Button)`
  display: block;
  margin: 12px 0px 0px 0px;
  width: 100%;
`;

const LoginCheckbox = styled(CheckBox)`
  display: block;
  margin-top: 10px;
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

export const LoginForm: React.FC<LoginFormProp> = ({
  input,
  onSubmit,

  className,
}) => {
  const currentInput: LoginFormInput = {
    email: '',
    password: '',
    saveId: false,
    autoLogin: false,
    ...input,
  };

  function clickHandler() {
    if (currentInput.email === '' || currentInput.password === '') return;

    if (onSubmit) {
      onSubmit(currentInput);
    }
  }

  // TODO:: Update placeholder text
  return <div className={className}>
    <LoginInput
      icon='account_circle'
      type='email'
      placeholder='카카오계정(이메일 또는 전화번호)'
      defaultValue={currentInput.email}
      onInput={(text) => currentInput.email = text}
    />
    <LoginInput
      icon='vpn_key'
      type='password'
      placeholder='비밀번호'
      defaultValue={currentInput.password}
      onInput={(text) => currentInput.password = text}
    />
    <LoginButton onClick={() => clickHandler()}>로그인</LoginButton>
    <LoginCheckbox
      id='saveId'
      status={{ checked: currentInput.saveId }}
      onInput={(status) => currentInput.saveId = status.checked}
    >아이디 저장</LoginCheckbox>
    <LoginCheckbox
      id='autoLogin'
      status={{ checked: currentInput.autoLogin }}
      onInput={(status) => currentInput.autoLogin = status.checked}
    >실행 시 자동 로그인</LoginCheckbox>
  </div>;
};
