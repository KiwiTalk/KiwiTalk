import { useAsyncLock } from '../../../hooks/async';
import { DeviceRegisterType } from '../../components/login/form/device-register';
import { LoginFormInput } from '../../components/login/form/login';
import { PasscodeForm } from '../../components/login/form/passcode';
import { registerDevice } from '../../../ipc/auth';

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
  const lock = useAsyncLock();

  function onPasscodeSubmit(passcode: string) {
    lock.tryLock(async () => {
      try {
        const res = await registerDevice(
          passcode,
          input.email,
          input.password,
          registerType === 'permanent',
        );

        onSubmit?.(res.status);
      } catch (e) {
        onError?.(e);
      }
    });
  }

  return <PasscodeForm onSubmit={onPasscodeSubmit} />;
};
