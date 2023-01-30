import styled from 'styled-components';
import { ReactComponent as KiwiSvg } from './icons/kiwi.svg';
import { ReactComponent as BackgroundSvg } from './images/background.svg';
import { ReactComponent as BackgroundPatternSvg } from './images/background-pattern.svg';

const BackgroundContainer = styled.div`
  width: 100%;
  height: 100%;
`;

const BackgroundInner = styled.div`
  position: absolute;
  left: 0%;
  top: 0%;

  width: 100%;
  height: 100%;
  background: linear-gradient(107.56deg, #FFFFFF 0%, #FFFAE0 100%);
  overflow: hidden;
`;

const KiwiIcon = styled(KiwiSvg)`
  color: rgba(0, 0, 0, 0.5);
  mix-blend-mode: overlay;

  width: 75%;
  height: 75%;

  position: absolute;

  left: 45%;
  top: 70%;
`;

const Background = styled(BackgroundSvg)`
  position: absolute;
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
    <BackgroundInner>
      <BackgroundPattern />
      <Background />
      <KiwiIcon />
    </BackgroundInner>
  </BackgroundContainer>;
};
