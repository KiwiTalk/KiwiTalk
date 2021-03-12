import React from 'react';
import LoginBackground from '../components/login/LoginBackground';
import { DeviceRegistration } from '../components/register/DeviceRegistration';

export const DeviceRegisterPage: React.FC = () => (
  <LoginBackground>
    <DeviceRegistration />
  </LoginBackground>
);

export default DeviceRegisterPage;
