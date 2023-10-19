import { render } from 'solid-js/web';
import { attachConsole } from 'tauri-plugin-log-api';

// import { App } from './app'; // TODO: remove this line
import { App, Layout } from './pages';

import '@/features/style-reset';

render(
    () => (
      <Layout>
        <App />
      </Layout>
    ),
  document.querySelector('#root')!,
);

attachConsole();
