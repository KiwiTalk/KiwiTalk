import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { ReactComponent as KiwiSvg } from './icons/kiwi.svg';

export type KiwiBackgroundProp = {
  className?: string,
};

export const KiwiBackground = ({
  className,

  children,
}: PropsWithChildren<KiwiBackgroundProp>) => {
  return <div className={className}>
    <Inner>
      {children}
      <KiwiIcon />
    </Inner>
  </div>;
};

const Inner = styled.div`
  width: 100%;
  height: 100%;

  position: relative;

  overflow: hidden;
`;

const KiwiIcon = styled(KiwiSvg)`
  color: rgba(0, 0, 0, 0.5);
  mix-blend-mode: overlay;

  min-width: 72%;
  min-height: 72%;

  max-width: 120%;
  max-height: 120%;

  position: absolute;

  right: -30%;
  bottom: -40%;
`;
