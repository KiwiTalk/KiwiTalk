import { useState } from 'react';
import styled from 'styled-components';
import { MaterialIconRound } from '../icon';

const CheckboxInput = styled.input`
  display: none;
`;

const CheckboxIcon = styled(MaterialIconRound)`
  padding: 0px;
  font-size: 1.125rem;

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

  onInput?: (status: CheckBoxStatus) => void,

  className?: string
}>;

export const CheckBox = ({
  id,
  status,
  disabled,
  onInput,

  className,
  children,
}: CheckBoxProp) => {
  const [currentStatus, setCurrentStatus] = useState<CheckBoxStatus>({
    checked: status?.checked ?? false,
    indeterminate: status?.indeterminate ?? false,
  });

  let currentIcon = 'check_box_outline_blank';
  if (currentStatus.indeterminate) {
    currentIcon = 'indeterminate_check_box';
  } else if (currentStatus.checked) {
    currentIcon = 'check_box';
  }

  function onInputChanged(input: HTMLInputElement) {
    const nextStatus = {
      checked: input.checked,
      indeterminate: input.indeterminate,
    };

    onInput?.(nextStatus);
    setCurrentStatus(nextStatus);
  }

  return <CheckboxContainer className={className}>
    <CheckboxInput
      id={id}
      defaultChecked={currentStatus.checked}
      disabled={disabled}
      type="checkbox"
      ref={(ref) => {
        if (!ref) return;
        ref.indeterminate = currentStatus.indeterminate || false;
      }}
      onInput={(e) => onInputChanged(e.currentTarget)}
    />
    <CheckboxLabel htmlFor={id} data-disabled={disabled}>
      <CheckboxIcon>{currentIcon}</CheckboxIcon>
      {children}
    </CheckboxLabel>
  </CheckboxContainer>;
};

