import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { WindowControl } from '../../components/window/control';
import { WindowTitleBar } from '../../components/window/title-bar';
import { Sidebar } from '../components/sidebar';

export type AppMainProp = {
};

export const AppMain = ({ }: AppMainProp) => {
  return <Window>
    <Sidebar />
  </Window>;
}

const TitleBar = styled(WindowTitleBar)`
  position: relative;
  display: flex;
  width: 100%;
`;

const Control = styled(WindowControl)`
  margin-left: auto;
`;

const ContentContainer = styled.div`
  width: 100%;
  height: 100%;

  display: flex;

  flex-direction: row;
`;

const WindowContainer = styled.div`
  display: flex;

  flex-direction: column;

  width: 100%;
  height: 100%;
`;

const Window = ({
  children,
}: PropsWithChildren) => {
  return <WindowContainer>
    <TitleBar>
      <Control />
    </TitleBar>
    <ContentContainer>
      {children}
    </ContentContainer>
  </WindowContainer>;
};