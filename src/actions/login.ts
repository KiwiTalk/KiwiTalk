import {
  AuthApiClient, CommandResultFailed, KnownAuthStatusCode, TalkClient,
} from 'node-kakao';
import { LoginData } from 'node-kakao/dist/api';
import UtilModules from '../utils';

export interface LoginForm {
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
}

export interface LoginContext {
  talkClient: TalkClient;
  authClient: AuthApiClient;
}

export enum LoginResultType {
  SUCCESS,
  FAILED,
  NEED_REGISTER,
  NEED_FORCE_LOGIN,
}

export interface LoginResult {
  type: LoginResultType;
  succeed?: LoginData;
  failed?: CommandResultFailed;
}

export async function login(
    {
      talkClient,
      authClient,
    }: LoginContext,
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
    const loginResult = await (async () => {
      if (!token) {
        return await authClient.login({ email, password, forced });
      } else {
        return await authClient.loginToken({ email, password, forced, autowithlock: false });
      }
    })();

    if (!loginResult.success) {
      throw loginResult;
    }

    await talkClient.login(loginResult.result);
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
      succeed: loginResult.result,
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
          failed: error,
        };
    }
  }
}
