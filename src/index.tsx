import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import UtilModules from './utils';
import * as serviceWorker from './service-worker';
import {LocoKickoutType, TalkClient} from 'node-kakao';
import os from 'os';
import axios from 'axios';

// Fix axios#552
// always use Node.js adapter;
axios.defaults.adapter = require('axios/lib/adapters/http');

(async () => {
  const uuid = await UtilModules.uuid.getUUID();

  const client = new TalkClient(os.hostname(), uuid, {
    version: '3.1.9',
    appVersion: '3.1.9.2626',
    xvcSeedList: ['JAYDEN', 'JAYMOND'],
  });

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
        <App { ...{client} } />
      </React.StrictMode>,
      document.getElementById('root'),
  );

  console.log(client);

  serviceWorker.unregister();
})();
