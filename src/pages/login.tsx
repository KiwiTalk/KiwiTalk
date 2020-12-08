import React, {useContext, useEffect, useState} from 'react';

import {AuthStatusCode} from 'node-kakao';

import LoginBackground from '../components/login/login-background';
import LoginForm from '../components/login/login-form';
import UtilModules from '../utils';
import { AppContext } from '../app';
import { DeviceRegistration } from '../components/register/device-registration';

export interface LoginFormData {
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
}

interface LoginData {
  token: boolean,
  inputData: LoginFormData;
}

export const Login = (): JSX.Element => {
  const [lastLoginData, setLastLoginData] = useState(null as LoginData | null);
  const [errorStatus, setErrorStatus] = useState(null as number | null);

  let client = useContext(AppContext).client;

  const onSubmit = async (
      formData: LoginFormData,
      force = false,
      token = false,
  ) => {
    await UtilModules.login.setAutoLogin(formData.autoLogin);

    let status: number = 0;
    try {
      if (!token) await client.login(formData.email, formData.password, force);
      else await client.loginToken(formData.email, formData.password, force);
      await UtilModules.login.setEmail(formData.saveEmail ? formData.email : '');
      await UtilModules.login.setAutoLoginEmail(
          client.Auth.getLatestAccessData().autoLoginEmail,
      );
      await UtilModules.login.setAutoLoginToken(
          client.Auth.generateAutoLoginToken(),
      );
    } catch (error) {
      status = error.status || null;
      console.log(error);

      if (AuthStatusCode.ANOTHER_LOGON === status) {
        const result = window.confirm(
          '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',
        );
  
        if (result) {
          console.log(formData, true, token);
          onSubmit(formData, true, token);
        }
      } else {
        setErrorStatus(status);
      }
    }

    setLastLoginData({token, inputData: formData});
    console.log('login: ' + status);
  };

  useEffect(() => {
    (async () => {
      const autoLogin = await UtilModules.login.isAutoLogin();

      if (autoLogin) {
        try {
          const loginToken = await UtilModules.login.getAutoLoginToken();
          if (loginToken !== null) {
            const autoLoginEmail = await UtilModules.login.getAutoLoginEmail();

            await onSubmit(
              {
                email: autoLoginEmail,
                password: loginToken,
                saveEmail: true,
                autoLogin: true
              },
              false,
              true,
            );

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

  if (lastLoginData && errorStatus) {
    let formData = lastLoginData.inputData;

    if (AuthStatusCode.DEVICE_NOT_REGISTERED === errorStatus) {
      return <LoginBackground>
        <DeviceRegistration
        formData={formData}
        onRegister={(permanent: boolean) => onSubmit(formData)}
        goPrevious={() => setErrorStatus(null)}
        />
        </LoginBackground>;
    }
  }

  return <LoginBackground>
      <LoginForm onSubmit={onSubmit}/>
    </LoginBackground>;
};

export default Login;
