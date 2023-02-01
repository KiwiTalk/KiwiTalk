import styled from 'styled-components';
import { LoginFormInput } from '../components/login/form/login';
import { LoginScreen } from '../../components/login/screen';
import { WindowTitleBar } from '../../components/window/title-bar';
import { AppWindowControl } from '../window/control';
import { AppLoginContent } from './content';
import { LoginAccessData } from '../../backend/auth';
import { PropsWithChildren } from 'react';

export type AppLoginProp = {
  defaultInput?: LoginFormInput,

  onLogin?: (data: LoginAccessData) => void
}

export const AppLogin = ({
  defaultInput,

  onLogin,
}: AppLoginProp) => {
  return <Window>
    <AppLoginContent defaultInput={defaultInput} onLogin={onLogin} />
  </Window>;
};

const Window = ({
  children,
}: PropsWithChildren) => {
  return <WindowContainer>
    <WindowTitle />
    <LoginScreen>
      {children}
    </LoginScreen>
  </WindowContainer>;
}

const WindowContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const TitleBar = styled(WindowTitleBar)`
  display: flex;
  position: absolute;
  width: 100%;
  top: 0px;

  z-index: 999999;
`;

const Control = styled(AppWindowControl)`
  margin-left: auto;
  background-color: rgba(0, 0, 0, .25);
  color: white;
  
  border-bottom-left-radius: 3px;
`;

const WindowTitle = () => {
  return <TitleBar>
    <Control />
  </TitleBar>;
};
