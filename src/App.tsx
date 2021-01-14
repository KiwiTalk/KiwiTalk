import { LocoKickoutType, TalkClient } from 'node-kakao';
import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Redirect, Route, Switch, useHistory } from 'react-router-dom';
import './App.css';

import MenuBar from './components/common/menubar/MenuBar';
import ChatPage from './pages/ChatPage';
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

const store = configureStore();

export const AppContext = React.createContext({} as AppTalkContext);

export const App: React.FC<AppProp> = ({ client }) => {
  const history = useHistory();

  useEffect(() => {
    const loginHandler = () => {
      console.log(history);
      history.push('/chat');
    };

    const disconnectedHandler = (reason: LocoKickoutType) => {
      if (
        reason === LocoKickoutType.CHANGE_SERVER ||
        reason === LocoKickoutType.UNKNOWN
      ) return;

      history.push('/login', { reason });
    };

    client.on('login', loginHandler);
    client.on('disconnected', disconnectedHandler);

    return () => {
      client.off('login', loginHandler);
      client.off('disconnected', disconnectedHandler);
    };
  });

  let menuBar: JSX.Element | null = null;

  switch (process.platform) {
    case 'darwin': case 'cygwin': case 'win32':
      menuBar = <MenuBar/>;
      break;
  }

  return (
    <Provider store={store}>
      <div className="App">
        {menuBar}
        <AppContext.Provider value={{ client }}>
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
    </Provider>
  );
};

export default App;
