import React, {useEffect, useState} from 'react';
import {useHistory} from 'react-router-dom';

import {AuthStatusCode, TalkClient, WebApiStatusCode} from 'node-kakao';

import LoginBackground from '../components/login/login-background';
import LoginForm from '../components/login/login-form';
import VerifyCode from '../components/verify/verify-code';
import UtilModules from '../utils';

export const Login = (client: TalkClient): JSX.Element => {
  const [loginData, setLoginData] = useState(
      {status: -999999, inputData: {email: '', password: '', autoLogin: false}});

  const onSubmit = async (
      email: string,
      password: string,
      saveEmail: boolean,
      autoLogin: boolean,
      force = false,
      token = false,
  ) => {
    await UtilModules.login.setAutoLogin(autoLogin);

    let status = -999999;
    try {
      if (!token) await client.login(email, password, force);
      else await client.loginToken(email, password, force);
      await UtilModules.login.setEmail(saveEmail ? email : '');
      await UtilModules.login.setAutoLoginEmail(client.Auth.getLatestAccessData().autoLoginEmail);
      await UtilModules.login.setAutoLoginToken(client.Auth.generateAutoLoginToken());

      status = WebApiStatusCode.SUCCESS;
    } catch (error) {
      status = error.status || -999999;
      console.log(error);
    }
    console.log('login: ' + status);

    setLoginData({status, inputData: {email, password, autoLogin}});
  };

  useEffect(() => {
    (async () => {
      const autoLogin = await UtilModules.login.isAutoLogin();

      if (autoLogin) {
        try {
          const loginToken = await UtilModules.login.getAutoLoginToken();
          if (loginToken !== null) {
            const autoLoginEmail = await UtilModules.login.getAutoLoginEmail();

            try {
              await onSubmit(
                  autoLoginEmail,
                  loginToken,
                  true,
                  true,
                  false,
                  true,
              );
            } catch (reason) {
              if (reason.status === AuthStatusCode.ANOTHER_LOGON) {
                const result = window.confirm(
                    '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',
                );
                if (result) {
                  await onSubmit(
                      autoLoginEmail,
                      loginToken,
                      true,
                      true,
                      true,
                      true,
                  );
                }
              } else {
                throw reason;
              }
            }

            alert('자동로그인 했습니다.');
          } else {
            throw new Error('자동로그인에 필요한 데이터가 없습니다.');
          }
        } catch (e) {
          alert('자동로그인에 실패했습니다: ' + e);
          console.error(e);
        }
      }
    })();
  }, []);

  useEffect(() => {
    (() => {
      switch (loginData.status) {
        case -999999:
          break;

        case WebApiStatusCode.SUCCESS:
          alert('로그인 성공');
          break;

        case AuthStatusCode.DEVICE_NOT_REGISTERED:
          const email = loginData.inputData.email;
          const password = loginData.inputData.password;

          client.Auth.requestPasscode(email, password, true);
          return <VerifyCode {
            ...{
              registerDevice: (passcode: string, permanent: boolean) =>
                client.Auth.registerDevice(passcode, email, password, permanent, true),
              passcodeDone: () => onSubmit(email, password, true, true)} } />;

        case AuthStatusCode.ANOTHER_LOGON:
          // eslint-disable-next-line no-case-declarations
          const result = window.confirm(
              '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',
          );

          if (result) {
            const email = loginData.inputData.email;
            const password = loginData.inputData.password;
            onSubmit(email, password, false, true, true);
          }
          break;

        default:
          console.log(loginData.status);
          alert(`오류가 발생했습니다. 오류 코드: ${loginData.status}`);
          setLoginData({status: -999999, inputData: loginData.inputData});
          break;
      }
    })();
  }, [loginData]);

  if (WebApiStatusCode.SUCCESS === loginData.status) {
    useHistory().push('/chat');
  }

  return <LoginBackground>
    <LoginForm onSubmit={onSubmit}/>
  </LoginBackground>;
};

export default Login;
