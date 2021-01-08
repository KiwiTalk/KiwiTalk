import { LocoKickoutType, TalkClient } from 'node-kakao';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Redirect, Route, Switch, useHistory } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';
import './App.css';

import MenuBar from './components/common/menu-bar/menu-bar';
import Chat from './pages/chat';
import Register from './pages/DeviceRegisterPage';
import Login from './pages/LoginPage';
import configureStore from './store';

export interface AppProp {
  client: TalkClient
}

export interface AppState {
  logon: boolean
}

export interface AppTalkContext {
  client: TalkClient
}

const { store, persistor } = configureStore();

export const AppContext = React.createContext({} as AppTalkContext);

export const App: React.FC<AppProp> = ({ client }) => {
  const history = useHistory();

  useEffect(() => {
    client.on('login', loginHandler);
    client.on('disconnected', disconnectedHandler);

    return () => {
      client.off('login', loginHandler);
      client.off('disconnected', disconnectedHandler);
    };
  });

  let menuBar: JSX.Element | null = null;

  switch (process.platform) {
    case 'darwin':
    case 'cygwin':
    case 'win32':
      menuBar = <MenuBar/>;
      break;
  }

  const loginHandler = () => {
    history.push('/chat');
  };

  const disconnectedHandler = (reason: LocoKickoutType) => {
    if (
      reason === LocoKickoutType.CHANGE_SERVER ||
      reason === LocoKickoutType.UNKNOWN
    ) {
      return;
    }

    history.push({
      pathname: '/login',
      state: {
        reason,
      },
    });
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <div className="App">
          {menuBar}
          <AppContext.Provider value={{ client }}>
            <BrowserRouter>
              <Switch>
                <Route path={'/'} exact>
                  <Redirect to={'/login'}/>
                </Route>
                <Route path={'/login'} component={Login} exact/>
                <Route path={'/register'} component={Register} exact/>
                <Route path={'/chat'} component={Chat} exact/>
              </Switch>
            </BrowserRouter>
          </AppContext.Provider>
        </div>
      </PersistGate>
    </Provider>
  );
};

export default App;
