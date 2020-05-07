import React from 'react';
import {HashRouter, Route, Redirect} from 'react-router-dom';
import './App.css';

import Login from './containers/Login';

const App = () => {
  return (
    <div className="App">
      <HashRouter>
        <Route path={'/'} render={() => <Redirect to={'/login'}/>} exact/>
        <Route path={'/login'} component={Login} exact/>
      </HashRouter>
    </div>
  );
}

export default App;
