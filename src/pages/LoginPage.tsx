import { Button, Dialog, DialogActions,
  DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { ServiceApiClient } from 'node-kakao';
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
import { setEmail, setPassword, setSaveEmail, setAutoLogin } from '../reducers/auth';
import { initServiceClient } from '../reducers/client';
import UtilModules from '../utils';

export interface LoginFormData {
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
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
  const [forceLogin, setForceLogin] = useState(false);

  const { talkClient, authClient, serviceClient } = useContext(AppContext);

  const onSubmit = async ({
    email,
    password,
    saveEmail,
    autoLogin,
  }: LoginFormData,
  force = false,
  token = false,
  ) => {
    if (!talkClient || !authClient) return;

    const result = await login(
        {
          talkClient,
          authClient,
        },
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
      case LoginResultType.SUCCESS: {
        // serviceClient register
        if (!serviceClient) {
          await (async () => {
            if (result.succeed) {
              const serviceApiClient = await ServiceApiClient.create(result.succeed);
              dispatch(initServiceClient(serviceApiClient));
            }
          })();
        }
        history.push('/chat');
        break;
      }
      case LoginResultType.NEED_REGISTER:
        dispatch(setEmail(email));
        dispatch(setPassword(password));
        dispatch(setSaveEmail(saveEmail));
        dispatch(setAutoLogin(autoLogin));

        history.push('/register');
        break;
      case LoginResultType.NEED_FORCE_LOGIN:
        dispatch(setEmail(email));
        dispatch(setPassword(password));
        dispatch(setSaveEmail(saveEmail));
        dispatch(setAutoLogin(autoLogin));

        setForceLogin(true);
        break;
      case LoginResultType.FAILED:
        if (result.failed?.status) {
          setError(LoginErrorReason[result.failed.status]);
        } else {
          setError(Strings.Error.UNKNOWN);
        }
        break;
    }
  };

  const onForceLogin = async () => {
    setForceLogin(false);

    await onSubmit(
        {
          email: auth.email,
          password: auth.password,
          saveEmail: auth.saveEmail,
          autoLogin: auth.autoLogin,
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
            // 자동 로그인 */
          } else {
            setError(Strings.Auth.NO_TOKEN);
          }
        } catch (e) {
          setError(`${Strings.Auth.AUTO_LOGIN_FAILED}\n${Strings.Auth.REASON} ${e.toString()}`);
          console.error(e);
        }
      }

      if (auth.email !== '') {
        await onSubmit(
            {
              email: auth.email,
              password: auth.password,
              saveEmail: auth.saveEmail,
              autoLogin: auth.autoLogin,
            },
            false,
            false,
        );
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
      open={forceLogin}
      onClose={
        () => setForceLogin(false)
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
        <Button onClick={() => setForceLogin(false)} color="primary">
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
