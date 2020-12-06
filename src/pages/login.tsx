import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';

import {AuthStatusCode, TalkClient, WebApiStatusCode} from 'node-kakao';

import LoginBackground from '../components/login/login-background';
import LoginForm from '../components/login/login-form';
import VerifyCode from '../components/verify/verify-code';

export const Login = (client: TalkClient): JSX.Element => {
  const [loginData, setLoginData] = useState(
      {
        status: -999999,
        inputData: {
          email: '',
          password: '',
          autoLogin: false,
        },
      },
  );

  const onSubmit = async (
      email: string,
      password: string,
      saveEmail: boolean,
      autoLogin: boolean,
      force = false,
  ) => {
    let status: number;
    try {
      await client.login(email, password, force);

      status = WebApiStatusCode.SUCCESS;
    } catch (error) {
      status = error.status || -999999;
      console.log(error);
    }
    console.log('login: ' + status);

    setLoginData({status, inputData: {email, password, autoLogin}});
  };

  switch (loginData.status) {
    case -999999:
      break;

    case WebApiStatusCode.SUCCESS:
      alert('로그인 성공');
      useHistory().push('/chat');
      break;

    case AuthStatusCode.DEVICE_NOT_REGISTERED: {
      const email = loginData.inputData.email;
      const password = loginData.inputData.password;

      client.Auth.requestPasscode(email, password, true);
      return <LoginBackground>
        <VerifyCode {
        ...{
          registerDevice: (
              passcode: string,
              permanent: boolean,
          ) => client.Auth.registerDevice(
              passcode,
              email,
              password,
              permanent,
              true,
          ),
          passcodeDone: () => onSubmit(email, password, true, true),
        }} />
      </LoginBackground>;
    }

    case AuthStatusCode.ANOTHER_LOGON: {
      const result = window.confirm(
          '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',
      );

      if (result) {
        const email = loginData.inputData.email;
        const password = loginData.inputData.password;
        onSubmit(email, password, false, true, true);
      }
      break;
    }
    default:
      alert(`오류가 발생했습니다. 오류 코드: ${status}`);
      setLoginData({status: -999999, inputData: loginData.inputData});
      break;
  }

  return <LoginBackground>
    <LoginForm onSubmit={onSubmit}/>
  </LoginBackground>;
};

export default Login;
