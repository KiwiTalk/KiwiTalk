import { useAsyncLock } from '../../../hooks/async';
import { LoginForm, LoginFormInput } from '../../components/login/form/login';
import { login, LoginAccessData, TalkResponseStatus } from '../../../backend/auth';

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
        const res = await login(input.email, input.password, forced ?? false);

        onSubmit?.(input, res);
      } catch (e) {
        onError?.(e);
      }
    });
  }

  return <LoginForm defaultInput={defaultInput} onSubmit={onLogin} />;
};
