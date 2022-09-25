import React, { InputHTMLAttributes } from 'react';
import styled from 'styled-components';
import { Icon } from '../icon';

const Input = styled.input`
  border: none;
  outline: none;
  
  margin-left: 10px;
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
  padding: 0px;
  font-size: 20px;
  color: #1E2019;

  transition: all 0.25s;

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
  return <InputBox data-disabled={disabled}>
    {icon && <InputIcon data-disabled={disabled}>{icon}</InputIcon>}
    <Input disabled={disabled} {...input}/>
  </InputBox>;
};
