import { ParentProps } from 'solid-js';

import { I18nProvider } from '@/features/i18n';
import { ConfigProvider } from '@/features/config';

import { WindowControls } from './_components/window-controls';
import { Router, Routes, hashIntegration } from '@solidjs/router';
import { classes, themeRoot } from '@/features/theme';
import { container } from './layout.css';
import { Transition } from 'solid-transition-group';

export const Provider = (props: ParentProps) => (
  <I18nProvider>
    <ConfigProvider>
      {props.children}
    </ConfigProvider>
  </I18nProvider>
);

export const Layout = (props: ParentProps) => (
  <Provider>
    <Router source={hashIntegration()}>
      <div
        classList={{
          [themeRoot]: true,
          [container]: true,
        }}
      >
        <WindowControls />
        <Transition appear mode={'outin'} {...classes.transition.scale}>
          <Routes>
            {props.children}
          </Routes>
        </Transition>
      </div>
    </Router>
  </Provider>
);
