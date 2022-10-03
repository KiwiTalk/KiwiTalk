import styled from 'styled-components';
import { LoginFormInput } from '../components/login/form/login';
import { LoginScreen } from '../../components/login/screen';
import { WindowTitleBar } from '../../components/window/title-bar';
import { AppWindowControl } from '../window/control';
import { AppLoginContent } from './content';
import { LoginAccessData } from './auth';

export type AppLoginProp = {
  defaultInput?: LoginFormInput,

  onLogin?: (data: LoginAccessData) => void
}

export const AppLogin = ({
  defaultInput,

  onLogin,
}: AppLoginProp) => {
  return <>
    <AppLoginWindowTitleBar />
    <LoginScreen>
      <AppLoginContent defaultInput={defaultInput} onLogin={onLogin}/>
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

const LoginWindowControl = styled(AppWindowControl)`
  margin-left: auto;
  background-color: rgba(0, 0, 0, .25);
  color: white;
`;

const AppLoginWindowTitleBar = () => {
  return <LoginTitleBar>
    <LoginWindowControl />
  </LoginTitleBar>;
};
