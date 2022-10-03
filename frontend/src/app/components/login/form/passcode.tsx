import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { InputForm } from '../../../../components/input-form';

import { ReactComponent as DialpadSvg } from './icons/dialpad.svg';

const PasscodeInput = styled(InputForm)`
  display: block;
  margin-bottom: 12px;
`;

export type PasscodeFormProp = {
  passcode?: string,
  onSubmit?: (passcode: string) => void,

  className?: string
}

export const PasscodeForm = ({
  passcode,
  onSubmit,

  className,
}: PasscodeFormProp) => {
  const { t } = useTranslation();

  function onInputHandler(text: string) {
    if (text.length === 4) {
      onSubmit?.(text);
    }
  }

  useEffect(() => {
    if (passcode) {
      onInputHandler(passcode);
    }
  }, []);

  return <div className={className}>
    <PasscodeInput
      icon={<DialpadSvg />}
      type='number'
      maxLength={4}
      placeholder={t('login.passcode_placeholder')}
      defaultValue={passcode}
      onInput={onInputHandler}
    />
  </div>;
};
