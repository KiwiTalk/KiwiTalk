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

type CheckBoxState = 'none' | 'checked' | 'indeterminate';

export const CheckBox = (props: CheckBoxProp) => {
  const [state, setState] = createSignal<CheckBoxState>('none');

  function onInputChanged(input: HTMLInputElement) {
    props.onInput?.({
      checked: input.checked,
      indeterminate: input.indeterminate,
    });

    if (input.indeterminate) {
      setState('indeterminate');
    } else if (input.checked) {
      setState('checked');
    } else {
      setState('none');
    }
  }

  createEffect(() => {
    if (props.status) {
      if (props.status.indeterminate) {
        setState('indeterminate');
      } else if (props.status.checked) {
        setState('checked');
      } else {
        setState('none');
      }
    }
  });

  return <CheckBoxContainer data-disabled={props.disabled} class={props.class}>
    <CheckBoxLabel>
      <CheckBoxInput
        name={props.name}
        checked={state() === 'checked'}
        disabled={props.disabled}
        type="checkbox"
        ref={(ref) => {
          ref.indeterminate = state() === 'indeterminate';
        }}
        onInput={(e) => onInputChanged(e.currentTarget)}
      />
      <IconContainer>
        <Switch>
          <Match when={state() === 'none'}>
            <CheckBoxOutlineBlankSvg />
          </Match>
          <Match when={state() === 'indeterminate'}>
            <CheckBoxIndeterminateSvg />
          </Match>
          <Match when={state() === 'checked'}>
            <CheckBoxIconSvg />
          </Match>
        </Switch>
      </IconContainer>
      {props.children}
    </CheckBoxLabel>
  </CheckBoxContainer>;
};
