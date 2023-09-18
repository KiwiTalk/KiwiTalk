import { JSX, Show, createSignal } from 'solid-js';
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
  defaultValue?: string,
  placeholder?: string,
  maxLength?: number,
  disabled?: boolean,

  onInput?: (text: string) => void,

  class?: string,
}

export const InputForm = (props: InputProp) => {
  const [activated, setActivated] = createSignal(!!props.defaultValue);

  function onInputHandler(element: HTMLInputElement) {
    if (props.maxLength && element.value.length > props.maxLength) {
      element.value = element.value.slice(0, props.maxLength);
      return;
    }

    props.onInput?.(element.value);
  }

  function activateHandler(input: HTMLInputElement, shouldActivate: boolean) {
    const nextState = !!input.value || shouldActivate;
    if (activated() !== nextState) setActivated(nextState);
  }

  return <InputBox
    data-disabled={props.disabled}
    data-activated={activated()}
    class={props.class}
  >
    <InnerWrapper>
      <Show when={props.icon}>
        <IconContainer>{props.icon}</IconContainer>
      </Show>
      <Input
        name={props.name}
        type={props.type}
        value={props.defaultValue}
        placeholder={props.placeholder}
        disabled={props.disabled}
        maxLength={props.maxLength}
        onFocus={(e) => activateHandler(e.currentTarget, true)}
        onBlur={(e) => activateHandler(e.currentTarget, false)}
        onInput={(e) => onInputHandler(e.currentTarget)}
      />
    </InnerWrapper>
  </InputBox>;
};
