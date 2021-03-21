import axios from 'axios';
import { AuthApiClient, OAuthApiClient, ServiceApiClient, TalkClient } from 'node-kakao';

import os from 'os';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import Configs from './constants/Configs';

import './index.css';

import * as serviceWorker from './service-worker';
import UtilModules from './utils';
import { KnownKickoutType } from 'node-kakao/dist/packet/chat';

// Fix axios#552
// always use Node.js adapter;
axios.defaults.adapter = require('axios/lib/adapters/http');

(async () => {
  ReactDOM.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
      document.getElementById('root'),
  );

  serviceWorker.unregister();
})();
