import { DeviceRegisterType } from '../../components/login/form/device-register';
import { LoginFormInput } from '../../components/login/form/login';
import { PasscodeForm } from '../../components/login/form/passcode';
import { Response, registerDevice } from '../../../ipc/api';
import { createResource, createSignal } from 'solid-js';

export type PasscodeContentProp = {
  registerType: DeviceRegisterType,
  input: LoginFormInput,

  onSubmit?: (response: Response<void>) => void,
  onError?: (e: unknown) => void
}

export const PasscodeContent = (props: PasscodeContentProp) => {
  const [passcode, setPasscode] = createSignal<string | null>(null);

  const [data] = createResource(passcode, async (passcode) => {
    if (data.loading) return;

    try {
      const response = await registerDevice(
          passcode,
          props.input.email,
          props.input.password,
          props.registerType === 'permanent',
      );

      props.onSubmit?.(response);
    } catch (e) {
      props.onError?.(e);
    }
  });

  return <PasscodeForm onSubmit={setPasscode} />;
};
