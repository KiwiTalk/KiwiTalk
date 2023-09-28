import { login } from '../../../ipc/client';
import { LoginForm, LoginFormInput } from '../../components/login/form/login';
import { createResource, createSignal } from 'solid-js';

export type LoginContentProp = {
  input?: Partial<LoginFormInput>,
  forced?: boolean,

  onSubmit?: (input: LoginFormInput, status: number) => void,
  onError?: (e: unknown) => void
}

export const LoginContent = (props: LoginContentProp) => {
  const [formInput, setFormInput] = createSignal<LoginFormInput | null>(null);

  const [data] = createResource(formInput, async (input) => {
    if (data.loading) return;

    try {
      const status = await login({
        email: input.email,
        password: input.password,
        saveEmail: input.saveId,
        autoLogin: input.autoLogin,
      }, props.forced ?? false, 'Unlocked');

      props.onSubmit?.(input, status);
    } catch (e) {
      props.onError?.(e);
    }
  });

  return <LoginForm input={props.input} onSubmit={setFormInput} />;
};
