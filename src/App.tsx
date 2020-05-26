import React from 'react';
import {HashRouter, Redirect, Route} from 'react-router-dom';
import './App.css';

import MenuBar from './components/MenuBar/MenuBar';
import Login from './containers/Login';
import VerifyCode from './containers/Verify';
import Chat from './containers/Chat';

const App = () => {
    return (
        <div className="App">
            {(() => {
                switch ((nw as any).process.platform) {
                    case 'darwin':
                    case 'cygwin':
                    case 'win32':
                        return true;
                    default:
                        return false;
                }
            })() &&
            <MenuBar/>
            }
            <HashRouter>
                <Route path={'/'} render={() => <Redirect to={'/login'}/>} exact/>
                <Route path={'/login'} component={Login} exact/>
                <Route path={'/verify'} component={VerifyCode} exact/>
                <Route path={'/chat'} component={Chat} exact/>
            </HashRouter>
        </div>
    );
}

export default App;
