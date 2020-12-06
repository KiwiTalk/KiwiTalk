import React from 'react';
import {HashRouter, Redirect, Route} from 'react-router-dom';
import './app.css';

import MenuBar from './components/common/menu-bar/menu-bar';
import login from './pages/login';
import chat from './pages/chat';
import {TalkClient} from 'node-kakao';

export const App = (opts: { client: TalkClient }): JSX.Element => {
  let menuBar: JSX.Element | null = null;

  switch (process.platform) {
    case 'darwin':
    case 'cygwin':
    case 'win32':
      menuBar = <MenuBar/>;
      break;
  }

  return (
    <div className="App">
      {menuBar}
      <HashRouter>
        <Route path={'/'} render={() => <Redirect to={'/index'}/>} exact/>
        <Route path={'/index'} component={
          () => login(opts.client)
        } exact/>
        <Route path={'/chat'} component={
          () => chat(opts.client)
        } exact/>
      </HashRouter>
    </div>
  );
};

export default App;
