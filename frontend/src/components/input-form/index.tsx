import React, { InputHTMLAttributes, useState, useRef } from 'react';
import styled from 'styled-components';
import { Icon } from '../icon';

const Input = styled.input`
  border: none;
  outline: none;
  
  padding: 0px;
  
  font-size: 12px;
  line-height: 14px;

  color: #1E2019;
  
  transition: all 0.25s;
  
  :focus {
    outline: none;
  }

  ::placeholder {
    color: #BFBDC1;
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

  display: inline-flex;
  justify-content: center;
  
  padding: 12px;
  
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(26, 60, 68, 0.07);
  
  transition: all 0.25s;

  &[data-disabled=true] {
    background: #F2F2F3;
    outline: 1px solid #BFBDC1;
  }
`;

const InputIcon = styled(Icon)`
  color: #BFBDC1;
  padding: 0px;
  font-size: 20px;

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
  disabled?: boolean,
  input?: InputHTMLAttributes<HTMLInputElement>
}

export const InputForm: React.FC<InputProp> = ({
  icon,
  disabled,
  input,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activated, setActivated] = useState(!!input?.value);

  const activateHandler = (shouldActive: boolean) => {
    return () => {
      const nextState = !!inputRef.current?.value || shouldActive;
      if (activated !== nextState) setActivated(nextState);
    };
  };

  return <InputBox data-disabled={disabled}>
    {icon && <InputIcon data-disabled={disabled} data-activated={activated}>{icon}</InputIcon>}
    <Input
      disabled={disabled}
      onFocus={activateHandler(true)}
      onBlur={activateHandler(false)}
      ref={inputRef}
      {...input}
    />
  </InputBox>;
};
