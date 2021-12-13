import axios from 'axios';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

import './index.css';

import * as serviceWorker from './service-worker';
import { Provider } from 'react-redux';
import configureStore from './store';

// Fix axios#552
// always use Node.js adapter;
axios.defaults.adapter = require('axios/lib/adapters/http');

const store = configureStore();

(async () => {
  ReactDOM.render(
      <React.StrictMode>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </React.StrictMode>,
      document.getElementById('root'),
  );

  serviceWorker.unregister();
})();
