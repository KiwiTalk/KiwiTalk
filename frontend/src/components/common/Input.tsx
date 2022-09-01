import React, { InputHTMLAttributes, useState } from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  width: 100%;
  height: 100%;
  
  border: none;
  background: none;
  
  margin-left: 10px;
  padding: 0;
  
  font-size: 12px;
  line-height: 12px;
  
  :focus {
    outline: none;
  }

  ::placeholder {
    color: rgba(191, 189, 193, 1);
  }
`;

const InputWrapper = styled.div`
  width: 100%;
  height: 45px;
  
  display: flex;
  align-items: center;

  background: #FFFFFF;
  
  margin-bottom: 12px;
  padding: 10px;
  
  border-radius: 10px;
  box-sizing: border-box;
  box-shadow: 0 4px 20px rgba(26, 60, 68, 0.07);
  
  transition: all 0.25s;
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
  -webkit-user-drag: none;
`;

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string
  icon: string
  disabledIcon: string
}

const Input: React.FC<InputProps> = ({
  placeholder,
  icon,
  disabledIcon,
  ...args
}) => {
  const [focus, setFocus] = useState(false);

  return (
    <InputWrapper>
      <Icon src={focus ? icon : disabledIcon}/>
      <StyledInput
        placeholder={placeholder}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...args}/>
    </InputWrapper>
  );
};

export default Input;
