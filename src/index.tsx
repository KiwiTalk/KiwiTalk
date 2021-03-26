import axios from 'axios';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import './index.css';

import * as serviceWorker from './service-worker';

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
