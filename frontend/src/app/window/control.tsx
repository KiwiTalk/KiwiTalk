import { appWindow } from '@tauri-apps/api/window';
import { ControlButtons, ControlType, WindowControl } from '../../components/window/control';

export type AppWindowControlProp = {
  buttons?: ControlButtons;
  class?: string;
}

export const AppWindowControl = (props: AppWindowControlProp) => {
  function onControlClick(type: ControlType) {
    switch (type) {
      case 'close': {
        appWindow.close().then();
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
    class={props.class}
    buttons={props.buttons}
    onControlClick={onControlClick}
  />;
};
