import { useTransContext } from '@jellybrick/solid-i18next';
import { Button } from '../../../../components/button';
import { styled } from '../../../../utils';
import { buttonDivider, registerButton } from './device-register.css';

const RegisterButton = styled(Button, registerButton);
const ButtonDivider = styled('div', buttonDivider);

export type DeviceRegisterType = 'permanent' | 'temporary';

export type DeviceRegisterFormProp = {
  onSubmit?: (type: DeviceRegisterType) => void,

  class?: string
}

export const DeviceRegisterForm = (props: DeviceRegisterFormProp) => {
  const [t] = useTransContext();

  function createOnClickHandler(type: DeviceRegisterType) {
    return () => {
      props.onSubmit?.(type);
    };
  }

  return <div class={props.class}>
    <RegisterButton onClick={createOnClickHandler('permanent')}>
      {t('login.register_type.permanent')}
    </RegisterButton>
    <ButtonDivider />
    <RegisterButton onClick={createOnClickHandler('temporary')}>
      {t('login.register_type.temporary')}
    </RegisterButton>
  </div>;
};
