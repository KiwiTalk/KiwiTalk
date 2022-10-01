import { useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as CheckBoxIconSvg } from './icons/check_box.svg';
import { ReactComponent as CheckBoxOutlineBlankSvg } from './icons/check_box_outline_blank.svg';
import { ReactComponent as CheckBoxIndeterminateSvg } from './icons/indeterminate_check_box.svg';

const CheckBoxInput = styled.input`
  display: none;
`;

const IconContainer = styled.div`
  width: 1.125rem;
  height: 1.125rem;

  margin-right: 6px;
`;

const CheckBoxContainer = styled.div`
  display: inline-block;
  padding: 3px 3px;
`;

const CheckBoxLabel = styled.label`
  display: flex;

  line-height: 1;

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

  let currentIcon = <CheckBoxOutlineBlankSvg />;
  if (currentStatus.indeterminate) {
    currentIcon = <CheckBoxIndeterminateSvg />;
  } else if (currentStatus.checked) {
    currentIcon = <CheckBoxIconSvg />;
  }

  function onInputChanged(input: HTMLInputElement) {
    const nextStatus = {
      checked: input.checked,
      indeterminate: input.indeterminate,
    };

    onInput?.(nextStatus);
    setCurrentStatus(nextStatus);
  }

  return <CheckBoxContainer className={className}>
    <CheckBoxInput
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
    <CheckBoxLabel htmlFor={id} data-disabled={disabled}>
      <IconContainer>{currentIcon}</IconContainer>
      {children}
    </CheckBoxLabel>
  </CheckBoxContainer>;
};

