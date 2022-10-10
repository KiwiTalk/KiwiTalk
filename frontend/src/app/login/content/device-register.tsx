import { useAsyncLock } from '../../../hooks/async';
import {
  DeviceRegisterForm,
  DeviceRegisterType,
} from '../../components/login/form/device-register';
import { LoginFormInput } from '../../components/login/form/login';
import { requestPasscode } from '../../../backend/auth';

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
  const lock = useAsyncLock();

  function onRegisterTypeSelected(type: DeviceRegisterType) {
    lock.tryLock(async () => {
      try {
        const res = await requestPasscode(input.email, input.password);

        onSubmit?.(res.status, type);
      } catch (e) {
        onError?.(e);
      }
    });
  }

  return <DeviceRegisterForm onSubmit={onRegisterTypeSelected} />;
};
