import { AuthStatusCode, TalkClient } from 'node-kakao';
import UtilModules from '../utils';

export interface LoginForm {
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
}

export interface LoginContext {
  client: TalkClient;
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
    force = false,
    token = false,
): Promise<LoginResult> {
  await UtilModules.login.setAutoLogin(autoLogin);

  let status = 0;
  try {
    if (!token) await client.login(email, password, force);
    else await client.loginToken(email, password, force);

    await UtilModules.login.setEmail(saveEmail ? email : '');
    await UtilModules.login.setAutoLoginEmail(
        client.Auth.getLatestAccessData().autoLoginEmail,
    );
    await UtilModules.login.setAutoLoginToken(
        client.Auth.generateAutoLoginToken(),
    );

    return {
      type: LoginResultType.SUCCESS,
    };
  } catch (error) {
    status = error.status ?? AuthStatusCode.LOGIN_FAILED;
    console.log(error);

    switch (status) {
      case AuthStatusCode.ANOTHER_LOGON:
        return {
          type: LoginResultType.NEED_FORCE_LOGIN,
        };
      case AuthStatusCode.DEVICE_NOT_REGISTERED:
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
