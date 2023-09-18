import { ParentProps } from 'solid-js';
import { KiwiContainer } from '../../components/kiwi-container';
import { WindowTitleBar } from '../../components/window/title-bar';
import { styled } from '../../utils';
import { AppWindowControl } from '../window/control';
import LogoTextSvg from './images/logo_text_small.svg';
import { contentContainer, control, logoText, titleBar, windowContainer } from './window.css';

const TitleBar = styled(WindowTitleBar, titleBar);
const Control = styled(AppWindowControl, control);
const ContentContainer = styled('div', contentContainer);
const WindowContainer = styled(KiwiContainer, windowContainer);
const LogoText = styled(LogoTextSvg, logoText);

export const AppWindow = (props: ParentProps) => {
  return <WindowContainer>
    <TitleBar>
      <LogoText />
      <Control />
    </TitleBar>
    <ContentContainer>
      {props.children}
    </ContentContainer>
  </WindowContainer>;
};
