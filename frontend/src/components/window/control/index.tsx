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
  width: 1.5rem;
  height: 1.25rem;

  user-select: none;
  border: none;
  outline: none;
  background: none;
  font-size: 0px;
  color: inherit;
  
  :hover {
    background: rgba(0, 0, 0, 0.1);
  }

  transition: all 0.25s;
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
      <IconMinimize />
    </ControlButton> : null }
    { buttons.maximize ? <ControlButton
      onClick={() => {
        onControlClick?.('maximize');
      }}>
      <IconMaximize />
    </ControlButton> : null }
    { buttons.close ? <CloseButton
      onClick={() => {
        onControlClick?.('close');
      }}>
      <IconClose />
    </CloseButton> : null }
  </ControlContainer>;
};
