import { Match, ParentProps, Switch, createEffect, createSignal } from 'solid-js';
import { styled } from '../../utils';
import CheckBoxIconSvg from './icons/check_box.svg';
import CheckBoxOutlineBlankSvg from './icons/check_box_outline_blank.svg';
import CheckBoxIndeterminateSvg from './icons/indeterminate_check_box.svg';
import { checkBoxContainer, checkBoxInput, checkBoxLabel, iconContainer } from './index.css';

const CheckBoxInput = styled('input', checkBoxInput);
const IconContainer = styled('div', iconContainer);
const CheckBoxContainer = styled('div', checkBoxContainer);
const CheckBoxLabel = styled('label', checkBoxLabel);

export type CheckBoxStatus = {
  checked: boolean,
  indeterminate: boolean
};

export type CheckBoxProp = ParentProps<{
  name?: string,
  status?: Partial<CheckBoxStatus>,
  disabled?: boolean,

  onInput?: (status: CheckBoxStatus) => void,

  class?: string
}>;

export const CheckBox = (props: CheckBoxProp) => {
  const [currentStatus, setCurrentStatus] = createSignal<CheckBoxStatus>({
    checked: props.status?.checked ?? false,
    indeterminate: props.status?.indeterminate ?? false,
  });

  function onInputChanged(input: HTMLInputElement) {
    const nextStatus = {
      checked: input.checked,
      indeterminate: input.indeterminate,
    };

    props.onInput?.(nextStatus);
    setCurrentStatus(nextStatus);
  }

  createEffect(() => {
    setCurrentStatus({
      checked: props.status?.checked ?? false,
      indeterminate: props.status?.indeterminate ?? false,
    });
  });

  return <CheckBoxContainer data-disabled={props.disabled} class={props.class}>
    <CheckBoxLabel>
      <CheckBoxInput
        name={props.name}
        checked={currentStatus().checked}
        disabled={props.disabled}
        type="checkbox"
        ref={(ref) => {
          if (!ref) return;
          ref.indeterminate = currentStatus().indeterminate || false;
        }}
        onInput={(e) => onInputChanged(e.currentTarget)}
      />
      <IconContainer>
        <Switch fallback={<CheckBoxOutlineBlankSvg />}>
          <Match when={currentStatus().indeterminate}>
            <CheckBoxIndeterminateSvg />
          </Match>
          <Match when={currentStatus().checked}>
            <CheckBoxIconSvg />
          </Match>
        </Switch>
      </IconContainer>
      {props.children}
    </CheckBoxLabel>
  </CheckBoxContainer>;
};

