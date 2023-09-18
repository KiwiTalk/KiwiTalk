import { render } from 'solid-js/web';

import { App } from './app';
import Provider from './app/provider';
import './global.css';

render(
    () => (
      <Provider>
        <App />
      </Provider>
    ),
  document.querySelector('#root')!,
);
