import { appWindow } from '@tauri-apps/api/window';
import { ControlButtons, ControlType, WindowControl } from '../../components/window/control';

export type AppWindowControlProp = {
  buttons?: ControlButtons,

  className?: string
}

export const AppWindowControl = ({
  buttons,

  className,
}: AppWindowControlProp) => {
  function onControlClick(type: ControlType) {
    switch (type) {
      case 'close': {
        appWindow.hide().then();
        break;
      }

      case 'maximize': {
        appWindow.toggleMaximize().then();
        break;
      }

      case 'minimize': {
        appWindow.minimize().then();
        break;
      }
    }
  }

  return <WindowControl
    className={className}
    buttons={buttons}
    onControlClick={onControlClick}
  />;
};
