import { useTransContext } from '@jellybrick/solid-i18next';
import { InputForm } from '../../../../components/input-form';

import DialpadSvg from './icons/dialpad.svg';
import { styled } from '../../../../utils';
import { passcodeInput } from './passcode.css';
import { onMount } from 'solid-js';

const PasscodeInput = styled(InputForm, passcodeInput);

export type PasscodeFormProp = {
  passcode?: string,
  onSubmit?: (passcode: string) => void,

  class?: string
}

export const PasscodeForm = (props: PasscodeFormProp) => {
  const [t] = useTransContext();

  function onInputHandler(text: string) {
    if (text.length === 4) {
      props.onSubmit?.(text);
    }
  }

  onMount(() => {
    if (props.passcode) {
      onInputHandler(props.passcode);
    }
  });

  return <div class={props.class}>
    <PasscodeInput
      icon={<DialpadSvg />}
      type='number'
      maxLength={4}
      placeholder={t('login.passcode_placeholder')}
      value={props.passcode}
      onInput={onInputHandler}
    />
  </div>;
};
