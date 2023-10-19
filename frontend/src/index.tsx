import { render } from 'solid-js/web';
import { attachConsole } from 'tauri-plugin-log-api';

import { App, Layout } from './pages';

import { injectMacOSGlobalStyle } from '@/features/style-reset';

injectMacOSGlobalStyle();

render(
  () => (
    <Layout>
      <App />
    </Layout>
  ),
  document.querySelector('#root')!,
);

attachConsole();
