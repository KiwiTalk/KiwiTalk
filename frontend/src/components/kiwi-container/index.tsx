import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { ReactComponent as KiwiSvg } from './icons/kiwi.svg';

export type KiwiContainerProp = {
  className?: string,
};

export const KiwiContainer = ({
  className,

  children,
}: PropsWithChildren<KiwiContainerProp>) => {
  return <Container className={className}>
    <KiwiIcon />
    {children}
  </Container>;
};

const Container = styled.div`
  position: relative;

  overflow: hidden;
`;

const KiwiIcon = styled(KiwiSvg)`
  color: rgba(0, 0, 0, 0.5);
  mix-blend-mode: overlay;

  min-width: 70%;
  min-height: 70%;

  max-width: 120%;
  max-height: 120%;

  position: absolute;

  right: -30%;
  bottom: -40%;
`;
