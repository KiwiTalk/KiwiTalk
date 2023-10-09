import { LoginScreen } from '../../components/login/screen';
import { WindowTitleBar } from '../../components/window/title-bar';
import { AppWindowControl } from '../window/control';
import { AppLoginContent } from './content';
import { control, screen, titleBar, windowContainer } from './index.css';
import { styled } from '../../utils';
import { ParentProps } from 'solid-js';

export type AppLoginProp = {
  errorMessage?: string,
  onLogin?: () => void,
}

export const AppLogin = (props: AppLoginProp) => {
  return <Window>
    <AppLoginContent errorMessage={props.errorMessage} onLogin={props.onLogin} />
  </Window>;
};

const Window = (props: ParentProps) => {
  return <WindowContainer>
    <WindowTitle />
    <Screen>
      {props.children}
    </Screen>
  </WindowContainer>;
};

const WindowContainer = styled('div', windowContainer);
const TitleBar = styled(WindowTitleBar, titleBar);
const Control = styled(AppWindowControl, control);
const Screen = styled(LoginScreen, screen);

const WindowTitle = () => {
  return <TitleBar>
    <Control />
  </TitleBar>;
};
