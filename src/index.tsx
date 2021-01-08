import axios from 'axios';
import { LocoKickoutType, TalkClient } from 'node-kakao';

import os from 'os';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import Configs from './constants/Configs';

import './index.css';

import * as serviceWorker from './service-worker';
import UtilModules from './utils';

// Fix axios#552
// always use Node.js adapter;
axios.defaults.adapter = require('axios/lib/adapters/http');

(async () => {
  const uuid = await UtilModules.uuid.getUUID();

  const client = new TalkClient(os.hostname(), uuid, Configs.CLIENT);

  client.on('disconnected', (reason) => {
    if (
      reason !== LocoKickoutType.UNKNOWN &&
      reason !== LocoKickoutType.CHANGE_SERVER
    ) {
      alert('disconnected. ' + reason);
    }
  });

  ReactDOM.render(
      <React.StrictMode>
        <App {...{ client }} />
      </React.StrictMode>,
      document.getElementById('root'),
  );

  console.log(client);

  serviceWorker.unregister();
})();
