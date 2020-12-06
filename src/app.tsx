import React from 'react';
import {HashRouter, Redirect, Route} from 'react-router-dom';
import './app.css';

import MenuBar from './components/common/menu-bar/menu-bar';
import Login from './pages/login';
import Chat from './pages/chat';
import {TalkClient} from 'node-kakao';

export const App = (opts: { client: TalkClient }): JSX.Element => {
  return (
    <div className="App">
      <MenuBar/>
      <HashRouter>
        <Route path={'/'} render={() => <Redirect to={'/index'}/>} exact/>
        <Route path={'/index'} component={ Login.bind(this, opts.client) } exact/>
        <Route path={'/chat'} component={ Chat.bind(this, opts.client) } exact/>
      </HashRouter>
    </div>
  );
};

export default App;
