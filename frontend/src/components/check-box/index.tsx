import React, { useState } from 'react';
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

export type CheckBoxStatus = {
  checked: boolean,
  indeterminate: boolean
};

export type CheckBoxProp = React.PropsWithChildren<{
  id: string,
  status?: Partial<CheckBoxStatus>,
  disabled?: boolean,

  onChange?: (status: CheckBoxStatus) => void,

  className?: string
}>;

export const CheckBox: React.FC<CheckBoxProp> = ({
  id,
  status,
  disabled,
  onChange,

  className,
  children,
}) => {
  const [currentStatus, setCurrentStatus] = useState<CheckBoxStatus>({
    checked: status?.checked || false,
    indeterminate: status?.indeterminate || false,
  });

  let currentIcon = 'check_box_outline_blank';
  if (currentStatus.indeterminate) {
    currentIcon = 'indeterminate_check_box';
  } else if (currentStatus.checked) {
    currentIcon = 'check_box';
  }

  const onInputChanged = (input: HTMLInputElement) => {
    const nextStatus = {
      checked: input.checked,
      indeterminate: input.indeterminate,
    };
    setCurrentStatus(nextStatus);

    if (onChange) {
      onChange(nextStatus);
    }
  };

  return <CheckboxContainer className={className}>
    <CheckboxInput
      id={id}
      checked={currentStatus.checked}
      disabled={disabled}
      type="checkbox"
      ref={(ref) => {
        if (!ref) return;
        ref.indeterminate = currentStatus.indeterminate || false;
      }}
      onChange={(e) => onInputChanged(e.currentTarget)}
    />
    <CheckboxLabel htmlFor={id} data-disabled={disabled}>
      <CheckboxIcon>{currentIcon}</CheckboxIcon>
      {children}
    </CheckboxLabel>
  </CheckboxContainer>;
};

