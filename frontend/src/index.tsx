import { render } from 'solid-js/web';

import { App } from './app';
import Provider from './app/providers';
import './global.css';
import { attachConsole } from 'tauri-plugin-log-api';

render(
    () => (
      <Provider>
        <App />
      </Provider>
    ),
  document.querySelector('#root')!,
);

await attachConsole();
