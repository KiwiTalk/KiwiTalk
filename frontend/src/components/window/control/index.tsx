import IconMinimizeSvg from './icons/icon_minimize.svg';
import IconMaximizeSvg from './icons/icon_maximize.svg';
import IconCloseSvg from './icons/icon_close.svg';
import { styled } from '../../../utils';
import { closeButton, controlButton, controlContainer } from './index.css';
import { Show, mergeProps } from 'solid-js';

const ControlContainer = styled('div', controlContainer);
const ControlButton = styled('button', controlButton);
const CloseButton = styled(ControlButton, closeButton);

export type ControlType = 'minimize' | 'maximize' | 'close';

export type ControlButtons = {
  minimize: boolean,
  maximize: boolean,
  close: boolean,
};

export type ControlProp = {
  buttons?: ControlButtons,

  onControlClick?: (type: ControlType) => void,

  class?: string
};

export const WindowControl = (props: ControlProp) => {
  const local = mergeProps({
    buttons: {
      minimize: true,
      maximize: true,
      close: true,
    },
  }, props);

  return <ControlContainer class={local.class}>
    <Show when={local.buttons.minimize}>
      <ControlButton
        onClick={() => {
          local.onControlClick?.('minimize');
        }}
      >
        <IconMinimizeSvg />
      </ControlButton>
    </Show>
    <Show when={local.buttons.maximize}>
      <ControlButton
        onClick={() => {
          local.onControlClick?.('maximize');
        }}
      >
        <IconMaximizeSvg />
      </ControlButton>
    </Show>
    <Show when={local.buttons.close}>
      <CloseButton
        onClick={() => {
          local.onControlClick?.('close');
        }}>
        <IconCloseSvg />
      </CloseButton>
    </Show>
  </ControlContainer>;
};
