import { useTransContext } from '@jellybrick/solid-i18next';
import { appWindow } from '@tauri-apps/api/window';
import { Accessor, createResource, mergeProps, onCleanup, untrack } from 'solid-js';
import { saveWindowState, StateFlags } from 'tauri-plugin-window-state-api';

import * as styles from './window-controls.css';

export type WindowControlsViewModelType = () => {
  isActive: Accessor<boolean>;
  onMinimize: () => void;
  onMaximize: () => void;
  onClose: () => void;
};

export const WindowControlsViewModel: WindowControlsViewModelType = () => {
  const [isFocused, { mutate: mutateIsFocused }] = createResource(
      () => appWindow.isFocused(),
  );

  const [unlisten] = createResource(
      () => appWindow.onFocusChanged(({ payload: focused }) => mutateIsFocused(focused)),
  );

  onCleanup(() => unlisten()?.());

  return {
    isActive: () => isFocused() ?? true,
    onMinimize: () => appWindow.minimize(),
    onMaximize: () => appWindow.toggleMaximize(),
    onClose: async () => {
      await saveWindowState(StateFlags.ALL);
      await appWindow.close();
    },
  };
};

type WindowControlsProps = {
  viewModel?: WindowControlsViewModelType
};

export const WindowControls = (props: WindowControlsProps) => {
  const merged = mergeProps({ viewModel: WindowControlsViewModel }, props);
  const instance = untrack(() => merged.viewModel());
  const [t] = useTransContext();

  const buttonVariant = () => instance.isActive() ? 'active' : 'inactive';

  return (
    <div class={styles.container}>
      <span class={styles.title}>KiwiTalk</span>
      <div class={styles.buttons}>
        <button
          aria-label={t('window-controls.minimize')}
          class={styles.buttonMinMax[buttonVariant()]}
          onClick={instance.onMinimize}
          type="button"
        />
        <button
          aria-label={t('window-controls.maximize')}
          class={styles.buttonMinMax[buttonVariant()]}
          onClick={instance.onMaximize}
          type="button"
        />
        <button
          aria-label={t('window-controls.close')}
          class={styles.buttonClose[buttonVariant()]}
          onClick={instance.onClose}
          type="button"
        />
      </div>
    </div>
  );
};
