import React from 'react';
import styled from 'styled-components';
import iconMinimize from './icons/icon_minimize.svg';
import iconMaximize from './icons/icon_maximize.svg';
import iconClose from './icons/icon_close.svg';

const ControlContainer = styled.div`
  border-bottom-left-radius: 3px;
  font-size: 0px;
  display: inline-block;
`;

const ControlButton = styled.button`
  width: 24px;
  height: 20px;
  user-select: none;
  border: none;
  outline: none;
  background: none;
  vertical-align: top;
  line-height: 0px;
  
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

const ControlIcon = styled.img`
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
      <ControlIcon src={iconMinimize} />
    </MinimizeButton>
    <ControlButton
      onClick={() => {
        if (onControlClick) onControlClick('maximize');
      }}>
      <ControlIcon src={iconMaximize} />
    </ControlButton>
    <CloseButton
      onClick={() => {
        if (onControlClick) onControlClick('close');
      }}>
      <ControlIcon src={iconClose} />
    </CloseButton>
  </ControlContainer>;
};
