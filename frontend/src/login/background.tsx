import styled from 'styled-components';
import { ReactComponent as KiwiSvg } from './icons/kiwi.svg';
import { ReactComponent as BackgroundSvg } from './images/background.svg';

const BackgroundContainer = styled.div`
  overflow: hidden;
  width: inherit;
  height: inherit;
`;

const BackgroundInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
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
  width: 100%;
  height: 100%;
`;

export type LoginBackgroundProp = {
  className?: string
};

export const LoginBackground: React.FC<LoginBackgroundProp> = ({
  className,
}) => {
  return <BackgroundContainer className={className}>
    <BackgroundInner>
      <Background />
      <KiwiIcon />
    </BackgroundInner>
  </BackgroundContainer>;
};
