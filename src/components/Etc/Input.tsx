import React, { InputHTMLAttributes, useState } from "react";
import styled from "styled-components";

const StyledInput = styled.input`
width: 100%;
height: 100%;
border: none;
margin-left: 10px;
padding: 0;
background: none;

:focus {
  outline: none;
}

::placeholder {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.3);
}
`;

const InputWrapper = styled.div`
width: 100%;
height: 50px;
display: flex;
align-items: center;
margin-bottom: 20px;
border-radius: 10px;
box-sizing: border-box;
padding: 10px;
background: #FFFFFF;
box-shadow: 0 4px 20px rgba(26, 60, 68, 0.07);
`;

const Icon = styled.img`
  width: 20px;
  height: 20px;
`

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder: string
  icon: string
  disabledIcon: string
}

const Input: React.FC<InputProps> = ({placeholder, icon, disabledIcon, ...args}) => {
  const [focus, setFocus] = useState(false);

  return (
      <InputWrapper>
          <Icon src={focus ? icon : disabledIcon}/>
          <StyledInput placeholder={placeholder} onFocus={() => setFocus(true)}
                       onBlur={() => setFocus(false)} {...args}/>
      </InputWrapper>
  );
};

export default Input;