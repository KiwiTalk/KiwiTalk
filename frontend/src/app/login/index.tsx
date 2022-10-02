import { appWindow } from '@tauri-apps/api/window';
import styled from 'styled-components';
import { ControlType, WindowControl } from '../../components/window/control';
import { WindowTitleBar } from '../../components/window/title-bar';
import { LoginFormInput } from '../../login/form/login';
import { LoginScreen } from '../../login/screen';
import { AppLoginContent } from './content';

export type AppLoginProp = {
  defaultInput?: LoginFormInput
}

export const AppLogin = ({
  defaultInput,
}: AppLoginProp) => {
  return <>
    <AppLoginWindowTitleBar />
    <LoginScreen>
      <AppLoginContent defaultInput={defaultInput}/>
    </LoginScreen>
  </>;
};

const LoginTitleBar = styled(WindowTitleBar)`
  display: flex;
  position: fixed;
  width: 100%;
  left: 0px;
  top: 0px;
  z-index: 999999;
`;

const LoginWindowControl = styled(WindowControl)`
  margin-left: auto;
  background-color: rgba(0, 0, 0, .25);
  color: white;
`;

const AppLoginWindowTitleBar = () => {
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

  return <LoginTitleBar>
    <LoginWindowControl onControlClick={onControlClick} />
  </LoginTitleBar>;
};
