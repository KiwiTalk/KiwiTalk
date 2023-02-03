import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { KiwiContainer } from '../../components/kiwi-container';
import { WindowTitleBar } from '../../components/window/title-bar';
import { AppWindowControl } from '../window/control';
import { ReactComponent as LogoTextSvg } from './images/logo_text_small.svg';

export const AppWindow = ({
  children,
}: PropsWithChildren) => {
  return <WindowContainer>
    <TitleBar>
      <LogoText />
      <Control />
    </TitleBar>
    <ContentContainer>
      {children}
    </ContentContainer>
  </WindowContainer>;
};

const TitleBar = styled(WindowTitleBar)`
  position: relative;
  display: flex;
  width: 100%;

  background: #FFFFFF;
`;

const Control = styled(AppWindowControl)`
  margin-left: auto;
  
  color: rgba(0, 0, 0, .5);
`;

const ContentContainer = styled.div`
  width: 100%;
  height: 100%;
  
  display: flex;
  
  flex-direction: row;
`;

const WindowContainer = styled(KiwiContainer)`
  display: flex;

  background: #DFDEE0;

  flex-direction: column;

  width: 100%;
  height: 100%;
`;

const LogoText = styled(LogoTextSvg)`
  margin: auto 4px;
`;
