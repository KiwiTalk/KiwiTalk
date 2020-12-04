import React, {useEffect, useState} from 'react';
import {Redirect} from 'react-router-dom';

import {AuthStatusCode, TalkClient, WebApiStatusCode} from 'node-kakao';

import LoginBackground from '../components/login/login-background';
import LoginForm from '../components/login/login-form';

import {LoginErrorReason} from '../constants';

const talkClient: TalkClient = nw.global.talkClient;

type LoginOption = {
    saveEmail: boolean
    autoLogin: boolean
    force?: boolean
}

// public 폴더로 이동시 헤더가 수정되서 제대로 작동하지 않음

async function login(
    client: TalkClient,
    email: string,
    password: string,
    {saveEmail, autoLogin, force}: LoginOption,
) {
  return async () => {
    await nw.global.login.setEmail(saveEmail ? email : '');
    await nw.global.login.setAutoLogin(autoLogin);

    try {
      await client.logout();
      await client.login(email, password, !!force);

      if (autoLogin) {
        await nw.global.login.setAutoLoginEmail(
            talkClient.Auth.getLatestAccessData().autoLoginEmail,
        );
        await nw.global.login.setAutoLoginToken(
            talkClient.Auth.generateAutoLoginToken(),
        );
      }

      return WebApiStatusCode.SUCCESS;
    } catch (error) {
      const status: number = error.status;
      const reason = LoginErrorReason.get(status);
      const message = error.message;

      let errorObject = new Error(message);
      errorObject = {
        ...error,
        status,
        reason,
      };
      throw errorObject;
    }
  };
}

nw.global.login.login = login;

// src 폴더안에서 등록해야 제대로 작동함.

export const Login = (): JSX.Element => {
  const [redirect, setRedirect] = useState('');

  const onSubmit = async (
      email: string,
      password: string,
      saveEmail: boolean,
      autoLogin: boolean,
      force = false,
  ) => {
    try {
      await nw.global.login.login(talkClient, email, password, {
        saveEmail,
        autoLogin,
        force,
      });

      alert('로그인 성공');
      setRedirect('chat');
    } catch (error) {
      switch (error.status) {
        case AuthStatusCode.DEVICE_NOT_REGISTERED:
          nw.global.login.data = {
            email,
            password,
            saveEmail,
            autoLogin,
            force,
          };

          setRedirect('verify');
          break;
        case AuthStatusCode.ANOTHER_LOGON: {
          const result = window.confirm(
              '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',
          );

          if (result) {
            nw.global.login.login(talkClient, email, password, {
              saveEmail,
              autoLogin,
              force: true,
            });
          }
          break;
        }
        default:
          if (error.message) {
            alert(`status: ${
              error.status
            }\n reason: ${
              error.reason
            }\n message : ${
              error.message
            }`);
          } else if (error.reason) {
            alert(`reason: ${error.reason}`);
          } else {
            alert(`알 수 없는 오류가 발생했습니다. 오류 코드: ${error.status}`);
          }
      }
    }
  };

  const autoLogin = async () => {
    const autoLogin = await nw.global.login.isAutoLogin();

    if (autoLogin) {
      try {
        const loginToken = await nw.global.login.getAutoLoginToken();
        const autoLoginEmail = await nw.global.login.getAutoLoginEmail();
        const uuid = await nw.global.util.getUUID();

        try {
          await talkClient.logout();
          await talkClient.loginToken(autoLoginEmail, loginToken, uuid);
          // TODO: nw.global.login.login 사용해서 loginToken 갱신해야함
        } catch (reason) {
          if (reason.status === AuthStatusCode.ANOTHER_LOGON) {
            const result = window.confirm(
                '이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?',
            );
            if (result) {
              await talkClient.logout();
              await talkClient.loginToken(
                  autoLoginEmail,
                  loginToken,
                  uuid,
                  true,
              );
            }
          } else {
            throw reason;
          }
        }

        alert('자동로그인 했습니다.');
        setRedirect('chat');
      } catch (e) {
        alert('자동로그인에 실패했습니다: ' + e);
      }
    }
  };

  // nw.global.global.index = index;

  useEffect(() => {
    autoLogin().then();
  }, []);

  return redirect ? <Redirect to={redirect}/> : (
        <LoginBackground>
          <LoginForm onSubmit={onSubmit}/>
        </LoginBackground>
    );
};

export default Login;
