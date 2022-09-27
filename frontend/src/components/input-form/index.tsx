import React, { useState } from 'react';
import styled from 'styled-components';
import { MaterialIconRound } from '../icon';

const Input = styled.input`
  border: none;
  outline: none;
  
  padding: 0px;

  flex: 1;

  color: #1E2019;
  
  transition: all 0.25s;
  
  :focus {
    outline: none;
  }

  ::placeholder {
    color: #BFBDC1;
    transition: all 0.25s;
  }

  :not(:disabled):hover::placeholder {
    color: #999999;
  }

  :disabled {
    background: none;
    color: #BFBDC1;
  }
`;

const InputBox = styled.div`
  background: #FFFFFF;
  outline: none;

  display: inline-block;
  
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(26, 60, 68, 0.07);
  
  transition: all 0.25s;

  &[data-disabled=true] {
    background: #F2F2F3;
    outline: 1px solid #BFBDC1;
  }
`;

const InnerWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 8px;
`;

const InputIcon = styled(MaterialIconRound)`
  color: #BFBDC1;
  padding: 0px;

  font-size: 1.25em;

  margin-right: 10px;

  transition: all 0.25s;

  &[data-activated=true] {
    color: #1E2019;
  }

  &[data-disabled=true] {
    color: #BFBDC1;
  }
`;

type InputProp = {
  icon?: string,

  type?: React.HTMLInputTypeAttribute,
  defaultValue?: string,
  placeholder?: string,
  maxLength?: number,
  disabled?: boolean,

  onInput?: (text: string) => void,

  className?: string,
}

export const InputForm: React.FC<InputProp> = ({
  icon,
  type,
  defaultValue,
  placeholder,
  maxLength,
  disabled,
  onInput,

  className,
}) => {
  const [activated, setActivated] = useState(!!defaultValue);

  function onInputHandler(element: HTMLInputElement) {
    if (maxLength && element.value.length > maxLength) {
      element.value = element.value.slice(0, maxLength);
      return;
    }

    onInput?.(element.value);
  }

  function activateHandler(input: HTMLInputElement, shouldActivate: boolean) {
    const nextState = !!input.value || shouldActivate;
    if (activated !== nextState) setActivated(nextState);
  }

  return <InputBox data-disabled={disabled} className={className}>
    <InnerWrapper>
      {icon && <InputIcon data-disabled={disabled} data-activated={activated}>{icon}</InputIcon>}
      <Input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onFocus={(e) => activateHandler(e.currentTarget, true)}
        onBlur={(e) => activateHandler(e.currentTarget, false)}
        onInput={(e) => onInputHandler(e.currentTarget)}
      />
    </InnerWrapper>
  </InputBox>;
};
