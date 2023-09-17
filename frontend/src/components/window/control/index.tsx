import styled from 'styled-components';
import { ReactComponent as IconMinimizeSvg } from './icons/icon_minimize.svg';
import { ReactComponent as IconMaximizeSvg } from './icons/icon_maximize.svg';
import { ReactComponent as IconCloseSvg } from './icons/icon_close.svg';

const ControlContainer = styled.div`
  font-size: 0px;
  display: inline-block;
  vertical-align: top;
  overflow: hidden;
`;

const ControlButton = styled.button`
  all: unset;

  width: 1.5rem;
  height: 1.25rem;

  text-align: center;
  vertical-align: middle;

  background: none;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  transition: all 0.25s;
`;

const CloseButton = styled(ControlButton)`
  &:hover {
    background: rgba(255, 0, 0, 0.8);
  }
`;

export type ControlType = 'minimize' | 'maximize' | 'close';

export type ControlButtons = {
  minimize: boolean,
  maximize: boolean,
  close: boolean,
};

export type ControlProp = {
  buttons?: ControlButtons,

  onControlClick?: (type: ControlType) => void,

  className?: string
};

export const WindowControl = ({
  buttons = {
    minimize: true,
    maximize: true,
    close: true,
  },
  onControlClick,

  className,
}: ControlProp) => {
  return <ControlContainer className={className}>
    { buttons.minimize ? <ControlButton
      onClick={() => {
        onControlClick?.('minimize');
      }}>
      <IconMinimizeSvg />
    </ControlButton> : null }
    { buttons.maximize ? <ControlButton
      onClick={() => {
        onControlClick?.('maximize');
      }}>
      <IconMaximizeSvg />
    </ControlButton> : null }
    { buttons.close ? <CloseButton
      onClick={() => {
        onControlClick?.('close');
      }}>
      <IconCloseSvg />
    </CloseButton> : null }
  </ControlContainer>;
};
