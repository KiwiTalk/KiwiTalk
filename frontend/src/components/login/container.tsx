import styled from 'styled-components';
import { ReactComponent as BackgroundSvg } from './images/background.svg';
import { ReactComponent as BackgroundPatternSvg } from './images/background-pattern.svg';
import { KiwiContainer } from '../kiwi-container';
import { PropsWithChildren } from 'react';

const ContentContainer = styled(KiwiContainer)`
  width: 100%;
  height: 100%;
`;

const Background = styled(BackgroundSvg)`
  position: absolute;

  left: 0%;
  top: 0%;

  width: 100%;
  height: 100%;
`;

const BackgroundPattern = styled(BackgroundPatternSvg)`
  position: absolute;

  width: 64%;
  height: 64%;

  left: 0%;
  top: 0%;
`;

const Container = styled.div`
  background: linear-gradient(107.56deg, #FFFFFF 0%, #FFFAE0 100%);

  position: relative;
`;

export type LoginBackgroundProp = {
  className?: string
};

export const LoginContainer = ({
  className,

  children,
}: PropsWithChildren<LoginBackgroundProp>) => {
  return <Container className={className}>
    <BackgroundPattern />
    <Background />
    <ContentContainer>
      {children}
    </ContentContainer>
  </Container>;
};
