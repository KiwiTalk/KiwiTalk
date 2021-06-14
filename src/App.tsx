import { AuthApiClient, ServiceApiClient, TalkClient } from 'node-kakao';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Switch, useHistory } from 'react-router-dom';
import './App.css';

import MenuBar from './components/common/menubar/MenuBar';
import ChatPage from './pages/ChatPage';
import Register from './pages/DeviceRegisterPage';
import Login from './pages/LoginPage';
import { packet } from 'node-kakao';
import UtilModules from './utils';
import Configs from './constants/Configs';
import { ReducerType } from './reducers';
import { initAuthClient, initTalkClient } from './reducers/client';
import * as os from 'os';

type KickoutType = packet.chat.KickoutType;
const KnownKickoutType = packet.chat.KnownKickoutType;

export interface AppTalkContext {
  talkClient?: TalkClient;
  authClient?: AuthApiClient;
  serviceClient?: ServiceApiClient;
}

export const AppContext = React.createContext<AppTalkContext>({});

export const App = (): JSX.Element => {
  // console.log(window.location.origin);
  // window.__dirname = window.location.origin;
  const {
    talkClient,
    authClient,
  } = useSelector((state: ReducerType) => state.client);
  const dispatch = useDispatch();
  const history = useHistory();

  // talkClient register
  useEffect(() => {
    if (!talkClient) {
      const client = new TalkClient(Configs.CLIENT);

      dispatch(initTalkClient(client));
    }
  }, [talkClient]);

  // authClient register
  useEffect(() => {
    if (!authClient) {
      (async () => {
        const uuid = await UtilModules.uuid.getUUID();

        const client = await AuthApiClient.create(
            os.hostname(),
            uuid,
            Configs.CLIENT,
        );

        dispatch(initAuthClient(client));
      })();
    }
  }, [authClient]);

  talkClient?.on('disconnected', (reason: string | KickoutType) => {
    if (reason !== KnownKickoutType.CHANGE_SERVER) {
      alert('disconnected. ' + reason);
    }
  });

  useEffect(() => {
    const disconnectedHandler = (reason: KickoutType) => {
      if (reason === KnownKickoutType.CHANGE_SERVER) return;

      history.push('/login', { reason });
    };

    talkClient?.on('disconnected', disconnectedHandler);

    return () => {
      talkClient?.off('disconnected', disconnectedHandler);
    };
  }, []);

  let menuBar: JSX.Element | null = null;

  switch (process.platform) {
    case 'darwin': case 'cygwin': case 'win32':
      menuBar = <MenuBar/>;
      break;
  }

  return (

    <div className="App">
      {menuBar}
      <AppContext.Provider
        value={{
          talkClient,
          authClient,
        }}
      >
        <Switch>
          <Route path={'/login'} component={Login} exact/>
          <Route path={'/register'} component={Register} exact/>
          <Route path={'/chat'} component={ChatPage} exact/>
          <Route path={'*'}>
            <Redirect to={'/login'}/>
          </Route>
        </Switch>
      </AppContext.Provider>
    </div>
  );
};

export default App;
