import { ParentProps, createResource, onCleanup } from 'solid-js';
import { Router, Routes, hashIntegration } from '@solidjs/router';
import { Transition } from 'solid-transition-group';
import { appWindow } from '@tauri-apps/api/window';

import { I18nProvider } from '@/features/i18n';
import { ConfigProvider } from '@/features/config';
import { classes, themeRoot } from '@/features/theme';

import { WindowControls } from './_components/window-controls';

import * as styles from './layout.css';
import { saveWindowState, StateFlags } from 'tauri-plugin-window-state-api';

export const Provider = (props: ParentProps) => (
  <I18nProvider>
    <ConfigProvider>
      {props.children}
    </ConfigProvider>
  </I18nProvider>
);

export const Layout = (props: ParentProps) => {
  const [isFocused, { mutate: mutateIsFocused }] = createResource(
    () => appWindow.isFocused(),
  );

  const [unlisten] = createResource(
    () => appWindow.onFocusChanged(({ payload: focused }) => mutateIsFocused(focused)),
  );

  const onMinimize = () => appWindow.minimize();
  const onMaximize = () => appWindow.toggleMaximize();
  const onClose = async () => {
    await saveWindowState(StateFlags.ALL);
    await appWindow.close();
  };

  onCleanup(() => unlisten()?.());

  return (
    <Provider>
      <Router source={hashIntegration()}>
        <div
          classList={{
            [themeRoot]: true,
            [styles.container]: true,
          }}
        >
          <WindowControls
            isActive={isFocused()}
            onMinimize={onMinimize}
            onMaximize={onMaximize}
            onClose={onClose}
          />
          <Transition appear mode={'outin'} {...classes.transition.scale}>
            <Routes>
              {props.children}
            </Routes>
          </Transition>
        </div>
      </Router>
    </Provider>
  );
};
