import React, {useEffect, useState} from 'react';
import {Redirect, useHistory} from 'react-router-dom';

import {AuthStatusCode, TalkClient, WebApiStatusCode} from 'node-kakao';

import LoginBackground from '../components/login/login-background';
import LoginForm from '../components/login/login-form';
import constants from '../constants';
import VerifyCode from '../components/verify/verify-code';

// public 폴더로 이동시 헤더가 수정되서 제대로 작동하지 않음

// src 폴더안에서 등록해야 제대로 작동함.

export const Login = (client: TalkClient): JSX.Element => {
  const [loginData, setLoginData] = useState(
    { status: -999999, inputData: { email: '', password: '', autoLogin: false } });

  const onSubmit = async (
      email: string,
      password: string,
      saveEmail: boolean,
      autoLogin: boolean,
      force = false,
  ) => {
    let status = -999999;
    try {
      await client.login(email, password, force);
      
      status = WebApiStatusCode.SUCCESS;
    } catch (error) {
      status = error.status || -999999;
      console.log(error);
    }
    console.log('login: ' + status);

    setLoginData({ status, inputData: { email, password, autoLogin } });
  }

  switch (loginData.status) {
    case -999999:
      break;

    case WebApiStatusCode.SUCCESS:
      alert('로그인 성공');
      useHistory().push('/chat');
      break;

    case AuthStatusCode.DEVICE_NOT_REGISTERED:
      let email = loginData.inputData.email;
      let password = loginData.inputData.password;
      
      client.Auth.requestPasscode(email, password, true);
      client.logout();
      return <VerifyCode {
        ...{
          registerDevice: (passcode: string, permanent: boolean) => client.Auth.registerDevice(passcode, email, password, permanent, true),
          passcodeDone: () => onSubmit(email, password, true, true)} } />;

    case AuthStatusCode.ANOTHER_LOGON:
      const result = window.confirm(
          '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',
      );

      if (result) {
        client.logout();

        let email = loginData.inputData.email;
        let password = loginData.inputData.password;
        onSubmit(email, password, false, true, true);
      }
      break;

    default:
      alert(`오류가 발생했습니다. 오류 코드: ${status}`);
      client.logout();
      setLoginData({ status: -999999, inputData: loginData.inputData });
      break;
  }

  return <LoginBackground>
          <LoginForm onSubmit={onSubmit}/>
        </LoginBackground>;
};

export default Login;
