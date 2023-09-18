import { DeviceRegisterType } from '../../components/login/form/device-register';
import { LoginFormInput } from '../../components/login/form/login';
import { PasscodeForm } from '../../components/login/form/passcode';
import { registerDevice } from '../../../ipc/auth';
import { createResource, createSignal } from 'solid-js';

export type PasscodeContentProp = {
  registerType: DeviceRegisterType,
  input: LoginFormInput,

  onSubmit?: (status: number) => void,
  onError?: (e: unknown) => void
}

export const PasscodeContent = (props: PasscodeContentProp) => {
  const [passcode, setPasscode] = createSignal<string | null>(null);

  const [data] = createResource(passcode, async (passcode) => {
    if (data.loading) return;

    try {
      const res = await registerDevice(
          passcode,
          props.input.email,
          props.input.password,
          props.registerType === 'permanent',
      );

      props.onSubmit?.(res.status);
    } catch (e) {
      props.onError?.(e);
    }
  });

  return <PasscodeForm onSubmit={setPasscode} />;
};
