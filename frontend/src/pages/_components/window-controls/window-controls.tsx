import { useTransContext } from '@jellybrick/solid-i18next';

import * as styles from './window-controls.css';

type WindowControlsProps = {
  isActive?: boolean;

  onMinimize?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
};

export const WindowControls = (props: WindowControlsProps) => {
  const [t] = useTransContext();

  const buttonVariant = () => props.isActive ? 'active' : 'inactive';

  return (
    <div data-tauri-drag-region class={styles.container}>
      <span data-tauri-drag-region class={styles.title}>KiwiTalk</span>
      <div data-tauri-drag-region class={styles.buttons}>
        <button
          aria-label={t('window-controls.minimize')}
          class={styles.buttonMinMax[buttonVariant()]}
          onClick={props.onMinimize}
          type="button"
        />
        <button
          aria-label={t('window-controls.maximize')}
          class={styles.buttonMinMax[buttonVariant()]}
          onClick={props.onMaximize}
          type="button"
        />
        <button
          aria-label={t('window-controls.close')}
          class={styles.buttonClose[buttonVariant()]}
          onClick={props.onClose}
          type="button"
        />
      </div>
    </div>
  );
};
