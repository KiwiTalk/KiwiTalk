import React, { useEffect, useState } from 'react';
import './app.css';

import MenuBar from './components/common/menu-bar/menu-bar';
import login from './pages/login';
import chat from './pages/chat';
import {LocoKickoutType, TalkClient} from 'node-kakao';

export interface AppProp {
  client: TalkClient
}

export interface AppState {
  logon: boolean
}

export interface AppTalkContext {
  client: TalkClient
}

export const AppContext: React.Context<AppTalkContext> = React.createContext({} as AppTalkContext);

export const App = (opts: { client: TalkClient }) => {
  let [logon, setLogon] = useState(false);

  let client = opts.client;

  let menuBar: JSX.Element | null = null;

  switch (process.platform) {
    case 'darwin':
    case 'cygwin':
    case 'win32':
      menuBar = <MenuBar/>;
      break;
  }

  let loginHandler = () => {
    alert('로그인 되었습니다.');
    setLogon(true);
  };

  let disconnectedHandler = (reason: LocoKickoutType) => {
    if (reason === LocoKickoutType.CHANGE_SERVER) {
      return;
    }

    alert(`로그아웃 되었습니다. reason: ${LocoKickoutType[reason]}`);
    setLogon(false);
  };

  useEffect(() => {
    client.on('login', loginHandler);
    client.on('disconnected', disconnectedHandler);

    return () => {
      client.off('login', loginHandler);
      client.off('disconnected', disconnectedHandler);
    };
  });

  let component: () => JSX.Element;
  if (!logon) {
    component = login;
  } else {
    component = chat;
  }

  return (
    <div className="App">
      {menuBar}
      <AppContext.Provider value={{client}}>
        {React.createElement(component, {})}
      </AppContext.Provider>
    </div>
  );
}

export default App;