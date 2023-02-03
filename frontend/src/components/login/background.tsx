import styled from 'styled-components';
import { ReactComponent as BackgroundSvg } from './images/background.svg';
import { ReactComponent as BackgroundPatternSvg } from './images/background-pattern.svg';
import { KiwiBackground } from '../kiwi-background';

const BackgroundContainer = styled(KiwiBackground)`
  background: linear-gradient(107.56deg, #FFFFFF 0%, #FFFAE0 100%);
`;

const Background = styled(BackgroundSvg)`
  position: relative;

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

export type LoginBackgroundProp = {
  className?: string
};

export const LoginBackground = ({
  className,
}: LoginBackgroundProp) => {
  return <BackgroundContainer className={className}>
    <BackgroundPattern />
    <Background />
  </BackgroundContainer>;
};
