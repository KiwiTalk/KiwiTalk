import { tauri } from '@tauri-apps/api';
import {
  DeviceRegisterForm,
  DeviceRegisterType,
} from '../../components/login/form/device-register';
import { LoginFormInput } from '../../components/login/form/login';
import { TalkResponseStatus } from '../auth';

export type DeviceRegisterContentProp = {
  input: LoginFormInput,

  onSubmit?: (status: number, type: DeviceRegisterType) => void,
  onError?: (e: unknown) => void
}

export const DeviceRegisterContent = ({
  input,

  onSubmit,
  onError,
}: DeviceRegisterContentProp) => {
  function onRegisterTypeSelected(type: DeviceRegisterType) {
    (async () => {
      const res = await tauri.invoke<TalkResponseStatus>('plugin:auth|request_passcode', {
        email: input.email,
        password: input.password,
      });

      onSubmit?.(res.status, type);
    })().then().catch(onError);
  }

  return <DeviceRegisterForm onSubmit={onRegisterTypeSelected} />;
};
