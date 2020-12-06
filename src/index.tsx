import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './app';
import UtilModules from './utils';
import * as serviceWorker from './service-worker';
import {TalkClient} from 'node-kakao';
import os from 'os';

// Fix axios#552
require('axios').defaults.adapter = require('axios/lib/adapters/http'); // always use Node.js adapter;

(async () => {
  let uuid = await UtilModules.uuid.getUUID();

  let client = new TalkClient(os.hostname(), uuid, {
    version: '3.1.9',
    appVersion: '3.1.9.2626',
    xvcSeedList: ['JAYDEN', 'JAYMOND'],
  });

  ReactDOM.render(
    <React.StrictMode>
      <App { ...{ client } }/>
    </React.StrictMode>,
    document.getElementById('root'),
  );

  console.log(client);

  serviceWorker.unregister();

})();
