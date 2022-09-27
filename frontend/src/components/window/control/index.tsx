import React from 'react';
import styled from 'styled-components';
import { ReactComponent as IconMinimizeSvg } from './icons/icon_minimize.svg';
import { ReactComponent as IconMaximizeSvg } from './icons/icon_maximize.svg';
import { ReactComponent as IconCloseSvg } from './icons/icon_close.svg';

const ControlContainer = styled.div`
  border-bottom-left-radius: 3px;
  font-size: 0px;
  display: inline-block;
  vertical-align: top;
`;

const ControlButton = styled.button`
  width: 1.5rem;
  height: 1.25rem;

  user-select: none;
  border: none;
  outline: none;
  background: none;
  line-height: 0px;
  color: inherit;
  
  :hover {
    background: rgba(0, 0, 0, 0.1);
  }

  transition: all 0.25s;
`;

const MinimizeButton = styled(ControlButton)`
  border-bottom-left-radius: 3px;
`;

const CloseButton = styled(ControlButton)`
  :hover {
    background: rgba(255, 0, 0, 0.8);
  }
`;

const IconMinimize = styled(IconMinimizeSvg)`
  vertical-align: middle;
`;

const IconMaximize = styled(IconMaximizeSvg)`
  vertical-align: middle;
`;

const IconClose = styled(IconCloseSvg)`
  vertical-align: middle;
`;

export type ControlType = 'minimize' | 'maximize' | 'close';

export type ControlProp = {
  onControlClick?: (type: ControlType) => void,

  className?: string
};

export const WindowControl: React.FC<ControlProp> = ({
  onControlClick,

  className,
}) => {
  return <ControlContainer className={className}>
    <MinimizeButton
      onClick={() => {
        if (onControlClick) onControlClick('minimize');
      }}>
      <IconMinimize />
    </MinimizeButton>
    <ControlButton
      onClick={() => {
        if (onControlClick) onControlClick('maximize');
      }}>
      <IconMaximize />
    </ControlButton>
    <CloseButton
      onClick={() => {
        if (onControlClick) onControlClick('close');
      }}>
      <IconClose />
    </CloseButton>
  </ControlContainer>;
};
