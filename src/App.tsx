import React from 'react';
import {HashRouter, Redirect, Route} from 'react-router-dom';
import './App.css';

import MenuBar from './components/MenuBar/MenuBar';
import Login from './containers/Login';
import VerifyCode from './containers/Verify';
import Chat from './containers/Chat';

const App = () => {
    // @ts-ignore
    console.log(nw.process.platform);
    // @ts-ignore
    switch (nw.process.platform) {
        case 'darwin':
        case 'cygwin':
        case 'win32':
            return (
                <div className="App">
                    <MenuBar/>
                    <HashRouter>
                        <Route path={'/'} render={() => <Redirect to={'/login'}/>} exact/>
                        <Route path={'/login'} component={Login} exact/>
                        <Route path={'/verify'} component={VerifyCode} exact/>
                        <Route path={'/chat'} component={Chat} exact/>
                    </HashRouter>
                </div>
            );
        default:
            return (
                <div className="App">
                    <HashRouter>
                        <Route path={'/'} render={() => <Redirect to={'/login'}/>} exact/>
                        <Route path={'/login'} component={Login} exact/>
                        <Route path={'/verify'} component={VerifyCode} exact/>
                        <Route path={'/chat'} component={Chat} exact/>
                    </HashRouter>
                </div>
            );
    }
}

export default App;
