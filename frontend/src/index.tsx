import { render } from 'solid-js/web';

import { App } from './app';
import Provider from './app/providers';
import './global.css';

render(
    () => (
      <Provider>
        <App />
      </Provider>
    ),
  document.querySelector('#root')!,
);
