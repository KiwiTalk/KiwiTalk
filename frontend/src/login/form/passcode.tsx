import styled from 'styled-components';
import { InputForm } from '../../components/input-form';

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
  function onInputHandler(text: string) {
    if (text.length === 4) {
      onSubmit?.(text);
    }
  }

  if (passcode) {
    onInputHandler(passcode);
  }

  // TODO:: Update placeholder text
  return <div className={className}>
    <PasscodeInput
      icon='dialpad'
      type='number'
      maxLength={4}
      placeholder='카카오톡 앱 : 설정>개인/보안>PC연결관리'
      defaultValue={passcode}
      onInput={onInputHandler}
    />
  </div>;
};
