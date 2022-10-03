import { tauri } from '@tauri-apps/api';
import { LoginForm, LoginFormInput } from '../../components/login/form/login';
import { LoginAccessData, TalkResponseStatus } from '../auth';

export type LoginContentProp = {
  defaultInput?: Partial<LoginFormInput>,
  forced?: boolean,

  onSubmit?: (input: LoginFormInput, res: TalkResponseStatus<LoginAccessData>) => void,
  onError?: (e: unknown) => void
}

export const LoginContent = ({
  defaultInput,
  forced,

  onSubmit,
  onError,
}: LoginContentProp) => {
  function onLogin(input: LoginFormInput) {
    (async () => {
      const res = await tauri.invoke<TalkResponseStatus<LoginAccessData>>('plugin:auth|login', {
        email: input.email,
        password: input.password,
        forced: forced ?? false,
      });

      onSubmit?.(input, res);
    })().then().catch(onError);
  }

  return <LoginForm input={defaultInput} onSubmit={onLogin} />;
};
