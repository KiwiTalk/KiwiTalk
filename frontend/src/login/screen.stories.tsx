import { Story } from '@storybook/react';
import styled from 'styled-components';
import { PasscodeForm } from './form/passcode';
import { LoginForm } from './form/login';

import { LoginScreen } from './screen';
import { DeviceRegisterForm } from './form/device-register';

export default {
  title: 'KiwiTalk/login/LoginScreen',
  component: LoginScreen,
};

const Container = styled.div`
  border: 1px solid #000000;
  width: 1280px;
  height: 720px;
`;

const LoginTemplate: Story<React.PropsWithChildren> = () => {
  return <Container>
    <LoginScreen>
      <LoginForm />
    </LoginScreen>
  </Container>;
};

export const Login = LoginTemplate.bind({});
Login.args = {};

const PasscodeTemplate: Story<React.PropsWithChildren> = () => {
  return <Container>
    <LoginScreen>
      <PasscodeForm />
    </LoginScreen>
  </Container>;
};

export const Passcode = PasscodeTemplate.bind({});
Passcode.args = {};

const DeviceRegisterTemplate: Story<React.PropsWithChildren> = () => {
  return <Container>
    <LoginScreen>
      <DeviceRegisterForm />
    </LoginScreen>
  </Container>;
};

export const DeviceRegister = DeviceRegisterTemplate.bind({});
DeviceRegister.args = {};

