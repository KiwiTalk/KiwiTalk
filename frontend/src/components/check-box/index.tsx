import { useState } from 'react';
import styled from 'styled-components';
import { ReactComponent as CheckBoxIconSvg } from './icons/check_box.svg';
import { ReactComponent as CheckBoxOutlineBlankSvg } from './icons/check_box_outline_blank.svg';
import { ReactComponent as CheckBoxIndeterminateSvg } from './icons/indeterminate_check_box.svg';

const CheckBoxInput = styled.input`
  display: none;
`;

const IconContainer = styled.div`
  display: inline-block;
  width: 1.125rem;
  height: 1.125rem;

  margin: auto 6px auto 0px;
  line-height: 0;
`;

const CheckBoxContainer = styled.div`
  display: inline-block;

  color: #1E2019;

  &[data-disabled=true] {
    color: #BFBDC1;
  }
`;

const CheckBoxLabel = styled.label`
  display: inline-flex;

  transition: all 0.25s;

  line-height: 1;
  padding: 3px 3px;
`;

export type CheckBoxStatus = {
  checked: boolean,
  indeterminate: boolean
};

export type CheckBoxProp = React.PropsWithChildren<{
  name?: string,
  status?: Partial<CheckBoxStatus>,
  disabled?: boolean,

  onInput?: (status: CheckBoxStatus) => void,

  className?: string
}>;

export const CheckBox = ({
  name,
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

  return <CheckBoxContainer data-disabled={disabled} className={className}>
    <CheckBoxLabel>
      <CheckBoxInput
        name={name}
        defaultChecked={currentStatus.checked}
        disabled={disabled}
        type="checkbox"
        ref={(ref) => {
          if (!ref) return;
          ref.indeterminate = currentStatus.indeterminate || false;
        }}
        onInput={(e) => onInputChanged(e.currentTarget)}
      />
      <IconContainer>{currentIcon}</IconContainer>
      {children}
    </CheckBoxLabel>
  </CheckBoxContainer>;
};

