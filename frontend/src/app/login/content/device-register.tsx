import {
  DeviceRegisterForm,
  DeviceRegisterType,
} from '../../components/login/form/device-register';
import { LoginFormInput } from '../../components/login/form/login';
import { requestPasscode } from '../../../ipc/auth';
import { createResource, createSignal } from 'solid-js';

export type DeviceRegisterContentProp = {
  input: LoginFormInput,

  onSubmit?: (status: number, type: DeviceRegisterType) => void,
  onError?: (e: unknown) => void
}

export const DeviceRegisterContent = (props: DeviceRegisterContentProp) => {
  const [type, setType] = createSignal<DeviceRegisterType | null>(null);

  const [data] = createResource(type, async (type) => {
    if (data.loading) return;

    try {
      const status = await requestPasscode(props.input.email, props.input.password);

      props.onSubmit?.(status, type);
    } catch (e) {
      props.onError?.(e);
    }
  });

  return <DeviceRegisterForm onSubmit={setType} />;
};
