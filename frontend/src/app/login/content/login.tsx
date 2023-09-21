import { LoginForm, LoginFormInput } from '../../components/login/form/login';
import { login, LoginAccessData, TalkResponseStatus } from '../../../ipc/auth';
import { createResource, createSignal } from 'solid-js';

export type LoginContentProp = {
  input?: Partial<LoginFormInput>,
  forced?: boolean,

  onSubmit?: (input: LoginFormInput, res: TalkResponseStatus<LoginAccessData>) => void,
  onError?: (e: unknown) => void
}

export const LoginContent = (props: LoginContentProp) => {
  const [formInput, setFormInput] = createSignal<LoginFormInput | null>(null);

  const [data] = createResource(formInput, async (input) => {
    if (data.loading) return;

    try {
      const res = await login(input.email, input.password, props.forced ?? false);

      props.onSubmit?.(input, res);
    } catch (e) {
      props.onError?.(e);
    }
  });

  return <LoginForm input={props.input} onSubmit={setFormInput} />;
};
