import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useHistory } from 'react-router-dom';
import { login, LoginResultType } from '../actions/login';
import { AppContext } from '../App';

import LoginBackground from '../components/login/LoginBackground';
import LoginForm from '../components/login/LoginForm';
import { LoginErrorReason } from '../constants/AuthConstants';
import Strings from '../constants/Strings';
import { ReducerType } from '../reducers';
import { setEmail, setPassword } from '../reducers/auth';
import UtilModules from '../utils';

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
  const [forceLogin, setForceLogin] = useState({
    isShow: false,
    saveEmail: false,
    autoLogin: false,
  });

  const { client } = useContext(AppContext);

  const onSubmit = async ({
    email,
    password,
    saveEmail,
    autoLogin,
  }: LoginFormData,
  force = false,
  token = false,
  ) => {
    const result = await login(
        { client },
        {
          email,
          password,
          saveEmail,
          autoLogin,
        },
        force,
        token,
    );

    switch (result.type) {
      case LoginResultType.SUCCESS:
        await dispatch(setEmail(email));
        await dispatch(setPassword(password));

        history.push('/chat');
        break;
      case LoginResultType.NEED_REGISTER:
        await dispatch(setEmail(email));
        await dispatch(setPassword(password));

        history.push('/register');
        break;
      case LoginResultType.NEED_FORCE_LOGIN:
        await dispatch(setEmail(email));
        await dispatch(setPassword(password));

        setForceLogin({
          isShow: true,
          saveEmail,
          autoLogin,
        });
        break;
      case LoginResultType.FAILED:
        setError(
            result.value?.message ??
            LoginErrorReason[result.value?.status] ??
            Strings.Error.UNKNOWN,
        );
        break;
    }
  };

  const onForceLogin = async () => {
    setForceLogin({
      isShow: false,
      saveEmail: forceLogin.saveEmail,
      autoLogin: forceLogin.autoLogin,
    });

    await onSubmit(
        {
          email: auth.email,
          password: auth.password,
          saveEmail: forceLogin.saveEmail,
          autoLogin: forceLogin.autoLogin,
        },
        true,
        false,
    );
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
                  autoLogin: autoLogin,
                },
                false,
                true,
            );
            // 자동 로그인
          } else {
            setError(Strings.Auth.NO_TOKEN);
          }
        } catch (e) {
          setError(`${Strings.Auth.AUTO_LOGIN_FAILED}\n${Strings.Auth.REASON} ${e.toString()}`);
          console.error(e);
        }
      }
    })();
  }, []);

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
          {Strings.Auth.REASON} {LoginErrorReason[reason]}
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
          {error}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setError('')} color="primary">
          {Strings.Common.OK}
        </Button>
      </DialogActions>
    </Dialog>
    <Dialog
      open={forceLogin.isShow}
      onClose={
        () => setForceLogin({
          isShow: false,
          saveEmail: forceLogin.saveEmail,
          autoLogin: forceLogin.autoLogin,
        })
      }>
      <DialogTitle>
        {Strings.Auth.Result.ANOTHER_DEVICE}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          {Strings.Auth.FORCE_LOGIN}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setForceLogin({
          isShow: false,
          saveEmail: forceLogin.saveEmail,
          autoLogin: forceLogin.autoLogin,
        })} color="primary">
          {Strings.Common.CLOSE}
        </Button>
        <Button onClick={onForceLogin} color="primary">
          {Strings.Common.OK}
        </Button>
      </DialogActions>
    </Dialog>
  </LoginBackground>;
};

export default LoginPage;
