import { JSX, Show, createEffect, createSignal } from 'solid-js';
import { styled } from '../../utils';
import { iconContainer, innerWrapper, input, inputBox } from './index.css';

const Input = styled('input', input);
const InputBox = styled('div', inputBox);
const InnerWrapper = styled('label', innerWrapper);
const IconContainer = styled('div', iconContainer);

type InputProp = {
  icon?: JSX.Element,

  name?: string,
  type?: JSX.InputHTMLAttributes<HTMLInputElement>['type'],
  value?: string,
  placeholder?: string,
  maxLength?: number,
  disabled?: boolean,

  onInput?: (text: string) => void,

  class?: string,
}

export const InputForm = (props: InputProp) => {
  const [focused, setFocused] = createSignal(false);
  const [value, setValue] = createSignal('');

  createEffect(() => {
    if (props.value != null) {
      setValue(props.value);
    }
  });

  function onInputHandler(element: HTMLInputElement) {
    try {
      if (props.maxLength && element.value.length > props.maxLength) {
        element.value = element.value.slice(0, props.maxLength);
        return;
      }
    } finally {
      setValue(element.value);
    }

    props.onInput?.(element.value);
  }

  return <InputBox
    data-disabled={props.disabled}
    data-activated={!!value() || focused()}
    class={props.class}
  >
    <InnerWrapper>
      <Show when={props.icon}>
        <IconContainer>{props.icon}</IconContainer>
      </Show>
      <Input
        name={props.name}
        type={props.type}
        value={value()}
        placeholder={props.placeholder}
        disabled={props.disabled}
        maxLength={props.maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onInput={(e) => onInputHandler(e.currentTarget)}
      />
    </InnerWrapper>
  </InputBox>;
};
