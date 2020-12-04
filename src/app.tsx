import React from 'react';
import {HashRouter, Redirect, Route} from 'react-router-dom';
import './app.css';

import MenuBar from './components/common/menu-bar/menu-bar';
import Login from './pages/login';
import VerifyCode from './pages/verify';
import Chat from './pages/chat';

export const App = () => {
  let menubar: JSX.Element | null = null;

  switch (nw.process.platform) {
    case 'darwin': case 'cygwin': case 'win32':
      menubar = <MenuBar/>;
      break;
  }

  return (
    <div className="App">
      {menubar}
      <HashRouter>
        <Route path={'/'} render={() => <Redirect to={'/index'}/>} exact/>
        <Route path={'/index'} component={Login} exact/>
        <Route path={'/verify'} component={VerifyCode} exact/>
        <Route path={'/chat'} component={Chat} exact/>
      </HashRouter>
    </div>
  );
};

export default App;
