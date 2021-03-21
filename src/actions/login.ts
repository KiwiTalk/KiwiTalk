import { AuthApiClient, KnownAuthStatusCode, } from 'node-kakao';
import UtilModules from '../utils';

export interface LoginForm {
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
}

export interface LoginContext {
  client: AuthApiClient;
}

export enum LoginResultType {
  SUCCESS,
  FAILED,
  NEED_REGISTER,
  NEED_FORCE_LOGIN,
}

export interface LoginResult {
  type: LoginResultType;
  value?: any;
}

export async function login(
    { client }: LoginContext,
    {
      email,
      password,
      saveEmail,
      autoLogin,
    }: LoginForm,
    forced = false,
    token = false,
): Promise<LoginResult> {
  await UtilModules.login.setAutoLogin(autoLogin);

  let status = 0;
  try {
    if (!token) await client.login({ email, password, forced });
    else await client.loginToken({ email, password, forced, autowithlock: false });

    await UtilModules.login.setEmail(saveEmail ? email : '');
    /*
    await UtilModules.login.setAutoLoginEmail(
        client.Auth.getLatestAccessData().autoLoginEmail,
    );
    await UtilModules.login.setAutoLoginToken(
        client.Auth.generateAutoLoginToken(),
    );
*/

    return {
      type: LoginResultType.SUCCESS,
    };
  } catch (error) {
    status = error.status ?? KnownAuthStatusCode.LOGIN_FAILED;
    console.log(error);

    switch (status) {
      case KnownAuthStatusCode.ANOTHER_LOGON:
        return {
          type: LoginResultType.NEED_FORCE_LOGIN,
        };
      case KnownAuthStatusCode.DEVICE_NOT_REGISTERED:
        return {
          type: LoginResultType.NEED_REGISTER,
        };
      default:
        return {
          type: LoginResultType.FAILED,
          value: error,
        };
    }
  }
}
