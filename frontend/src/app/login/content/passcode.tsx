import { tauri } from '@tauri-apps/api';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import { LoginFormInput } from '../../components/login/form/login';
import { PasscodeForm } from '../../components/login/form/passcode';
import { TalkResponseStatus } from '../auth';

export type PasscodeContentProp = {
  registerType: DeviceRegisterType,
  input: LoginFormInput,

  onSubmit?: (status: number) => void,
  onError?: (e: unknown) => void
}

export const PasscodeContent = ({
  registerType,
  input,

  onSubmit,
  onError,
}: PasscodeContentProp) => {
  function onPasscodeSubmit(passcode: string) {
    (async () => {
      const res = await tauri.invoke<TalkResponseStatus>('plugin:auth|register_device', {
        passcode,
        email: input.email,
        password: input.password,
        permanent: registerType === 'permanent',
      });

      onSubmit?.(res.status);
    })().then().catch(onError);
  }

  return <PasscodeForm onSubmit={onPasscodeSubmit} />;
};
