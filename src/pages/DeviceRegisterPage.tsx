import React from 'react';
import LoginBackground from '../components/login/LoginBackground';
import { DeviceRegistration } from '../components/register/DeviceRegistration';

interface DeviceRegisterPageProps {
  onSubmit: (force?: boolean, token?: boolean ) => Promise<void>;
};

export const DeviceRegisterPage: React.FC<DeviceRegisterPageProps> = ({ onSubmit }) => (
  <LoginBackground>
    <DeviceRegistration onRegister={() => onSubmit()} />
  </LoginBackground>
);

export default DeviceRegisterPage;
