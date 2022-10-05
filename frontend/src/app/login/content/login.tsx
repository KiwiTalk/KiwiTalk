import { tauri } from '@tauri-apps/api';
import { useAsyncLock } from '../../../hooks/async';
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
  const lock = useAsyncLock();

  function onLogin(input: LoginFormInput) {
    lock.tryLock(async () => {
      try {
        const res = await tauri.invoke<TalkResponseStatus<LoginAccessData>>('plugin:auth|login', {
          email: input.email,
          password: input.password,
          forced: forced ?? false,
        });

        onSubmit?.(input, res);
      } catch (e) {
        onError?.(e);
      }
    });
  }

  return <LoginForm input={defaultInput} onSubmit={onLogin} />;
};
