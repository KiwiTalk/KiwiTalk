import React, { InputHTMLAttributes, useState, useRef } from 'react';
import styled from 'styled-components';
import { MaterialIconRound } from '../icon';

const CheckboxInput = styled.input`
  display: none;

`;

const CheckboxIcon = styled(MaterialIconRound)`
  padding: 0px;
  font-size: 18px;

  margin-right: 6px;
`;

const CheckboxContainer = styled.div`
  display: inline-block;
`;

const CheckboxLabel = styled.label`
  display: inline-flex;
  align-items: center;

  padding: 3px 3px;

  color: #1E2019;
  font-size: 12px;

  transition: all 0.25s;

  &[data-disabled=true] {
    color: #BFBDC1;
  }
`;

export type CheckBoxProp = React.PropsWithChildren<{
  id: string,
  checked?: boolean,
  indeterminate?: boolean,
  disabled?: boolean,
  checkbox?: InputHTMLAttributes<HTMLInputElement>,

  className?: string
}>;

type CheckBoxStatus = {
  checked?: boolean,
  indeterminate?: boolean
};

export const CheckBox: React.FC<CheckBoxProp> = ({
  id,
  checked,
  indeterminate,
  disabled,
  checkbox,

  className,
  children,
}) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [status, setStatus] = useState<CheckBoxStatus>({ checked, indeterminate });

  let currentIcon = 'check_box_outline_blank';
  if (status.indeterminate) {
    currentIcon = 'indeterminate_check_box';
  } else if (status.checked) {
    currentIcon = 'check_box';
  }

  const onInputChanged = () => {
    if (!inputRef.current) return;

    const nextStatus = {
      checked: inputRef.current.checked,
      indeterminate: inputRef.current.indeterminate,
    };

    setStatus(nextStatus);
  };

  return <CheckboxContainer className={className}>
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
      onChange={() => onInputChanged()}
    />
    <CheckboxLabel htmlFor={id} data-disabled={disabled}>
      <CheckboxIcon>{currentIcon}</CheckboxIcon>
      {children}
    </CheckboxLabel>
  </CheckboxContainer>;
};

