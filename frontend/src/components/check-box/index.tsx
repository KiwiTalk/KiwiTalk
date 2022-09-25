import React, { InputHTMLAttributes, useState, useRef } from 'react';
import styled from 'styled-components';
import { MaterialRoundIcon } from '../icon';

const CheckboxInput = styled.input`
  display: none;

`;

const CheckboxIcon = styled(MaterialRoundIcon)`
  padding: 0px;
  font-size: 18px;

  margin-right: 6px;
`;

const CheckboxContainer = styled.div`
  display: inline-block;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  justify-content: center;

  padding: 3px 3px;

  color: #1E2019;
  font-size: 12px;

  transition: all 0.25s;

  &[data-disabled=true] {
    color: #BFBDC1;
  }
`;

export type CheckBoxProp = {
  id: string,
  label?: string,
  checked?: boolean,
  indeterminate?: boolean,
  disabled?: boolean,
  checkbox?: InputHTMLAttributes<HTMLInputElement>
};

type CheckBoxStatus = {
  checked?: boolean,
  indeterminate?: boolean
};

export const CheckBox: React.FC<CheckBoxProp> = ({
  id,
  label,
  checked,
  indeterminate,
  disabled,
  checkbox,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<CheckBoxStatus>({ checked, indeterminate });

  let currentIcon = 'check_box_outline_blank';
  if (status.indeterminate) {
    currentIcon = 'indeterminate_check_box';
  } else if (status.checked) {
    currentIcon = 'check_box';
  }

  const onCheckChanged = () => {
    if (!inputRef.current) return;

    const nextStatus = {
      checked: inputRef.current.checked,
      indeterminate: inputRef.current.indeterminate,
    };

    setStatus(nextStatus);
  };

  return <CheckboxContainer>
    <CheckboxInput
      {...checkbox}
      id={id}
      checked={status.checked}
      disabled={disabled}
      type="checkbox"
      ref={(ref) => {
        if (!ref) return;
        ref.indeterminate = status.indeterminate || false;
        inputRef.current = ref;
      }}
      onChange={() => onCheckChanged()}
    />
    <CheckboxLabel htmlFor={id} data-disabled={disabled}>
      <CheckboxIcon>{currentIcon}</CheckboxIcon>
      <span>{label}</span>
    </CheckboxLabel>
  </CheckboxContainer>;
};

