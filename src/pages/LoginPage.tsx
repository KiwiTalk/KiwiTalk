import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useHistory } from 'react-router-dom';
import { AuthStatusCode } from 'node-kakao';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { AppContext } from '../App';

import LoginBackground from '../components/login/LoginBackground';
import LoginForm from '../components/login/LoginForm';
import { LoginErrorReason } from '../constants/AuthConstants';
import Strings from '../constants/Strings';
import { ReducerType } from '../reducers';
import UtilModules from '../utils';
import { setLoginOption } from '../reducers/auth';
import { setEmail } from '../utils/auto-login';

export interface LoginFormData {
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
}

interface LoginData {
  token: boolean;
  inputData: LoginFormData;
}

interface LoginPageProps {
  reason: number;
}

export const LoginPage: React.FC<LoginPageProps> = ({ reason: initReason }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const auth = useSelector((state: ReducerType) => state.auth);

  const [reason, setLogout] = useState(initReason ?? 0);
  const [error, setError] = useState('');

  const client = useContext(AppContext).client;

  const onSubmit = async (
      force = false,
      token = false,
  ) => {
    await UtilModules.login.setAutoLogin(auth.autoLogin);

    let status = 0;
    try {
      if (!token) await client.login(auth.email, auth.password, force);
      else await client.loginToken(auth.email, auth.password, force);

      // await UtilModules.login.setEmail(auth.saveEmail ? auth.email : '');
      await UtilModules.login.setAutoLoginEmail(
          client.Auth.getLatestAccessData().autoLoginEmail,
      );
      await UtilModules.login.setAutoLoginToken(
          client.Auth.generateAutoLoginToken(),
      );
      await dispatch(setEmail(auth.saveEmail ? auth.email : ''));

      history.push('chat');
      return;
    } catch (error) {
      status = error.status ?? null;
      console.log(error);

      if (status === AuthStatusCode.ANOTHER_LOGON) {
        const result = window.confirm(Strings.Auth.FORCE_LOGIN);

        if (result) {
          await onSubmit(true, token);
        }
      } else if (status === AuthStatusCode.DEVICE_NOT_REGISTERED) {
        history.push('/register');
      } else {
        setError(error.message ?? LoginErrorReason.get(status) ?? Strings.Error.UNDEFINED);
        return;
      }
    }

    history.push('/register');
  };

  useEffect(() => {
    (async () => {
      const autoLogin = await UtilModules.login.isAutoLogin();

      if (autoLogin) {
        try {
          const loginToken = await UtilModules.login.getAutoLoginToken();
          if (loginToken !== null) {
            const autoLoginEmail = await UtilModules.login.getAutoLoginEmail();

            dispatch(setLoginOption({
              saveEmail: autoLoginEmail,
            }));
            await onSubmit(
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

  /*
  if (lastLoginData && errorStatus) {
    const { inputData } = lastLoginData;

    if (AuthStatusCode.DEVICE_NOT_REGISTERED === errorStatus) {
      return <LoginBackground>
        <DeviceRegistration
          formData={inputData}
          onRegister={(permanent: boolean) => onSubmit(inputData)}
          goPrevious={() => setErrorStatus(null)}
        />
      </LoginBackground>;
    }
  }
  */

  return <LoginBackground>
    <LoginForm onSubmit={onSubmit}/>
    <Dialog
      open={reason !== 0}
      onClose={() => setLogout(0)}>
      <DialogTitle>
        {Strings.Auth.LOGOUT_MESSAGE}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {Strings.Auth.REASON} {LoginErrorReason.get(reason)}
        </DialogContentText>
      </DialogContent>
    </Dialog>
    <Dialog
      open={error !== ''}
      onClose={() => setError('')}>
      <DialogTitle>
        {Strings.Auth.LOGIN_FAILED}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {Strings.Auth.REASON} {error}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setError('')} color="primary">
          {Strings.Common.OK}
        </Button>
      </DialogActions>
    </Dialog>
  </LoginBackground>;
};

export default LoginPage;
