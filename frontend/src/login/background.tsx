import styled from 'styled-components';
import { ReactComponent as KiwiSvg } from './icons/kiwi.svg';
import { ReactComponent as BackgroundSvg } from './images/background.svg';

const BackgroundContainer = styled.div`
  overflow: hidden;
`;

const BackgroundInner = styled.div`
  position: absolute;
  width: inherit;
  height: inherit;
  background: linear-gradient(107.56deg, #FFFFFF 0%, #FFFAE0 100%);
`;

const KiwiIcon = styled(KiwiSvg)`
  color: rgba(0, 0, 0, 0.5);
  mix-blend-mode: overlay;

  width: 75%;
  height: 75%;

  position: relative;
  float: right;

  left: 20%;
  top: 70%;
`;

const Background = styled(BackgroundSvg)`
  position: absolute;
  width: inherit;
  height: inherit;
`;

export type LoginBackgroundProp = {
  className?: string
};

export const LoginBackground: React.FC<LoginBackgroundProp> = ({
  className,
}) => {
  return <BackgroundContainer className={className}>
    <BackgroundInner />
    <Background />
    <KiwiIcon />
  </BackgroundContainer>;
};
