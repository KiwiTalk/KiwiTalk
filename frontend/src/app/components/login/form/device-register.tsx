import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Button } from '../../../../components/button';

const RegisterButton = styled(Button)`
  display: block;
  width: 100%;
`;

const ButtonDivider = styled.div`
  height: 12px;
`;

export type DeviceRegisterType = 'permanent' | 'temporary';

export type DeviceRegisterFormProp = {
  onSubmit?: (type: DeviceRegisterType) => void,

  className?: string
}

export const DeviceRegisterForm = ({
  onSubmit,

  className,
}: DeviceRegisterFormProp) => {
  const { t } = useTranslation();

  function createOnClickHandler(type: DeviceRegisterType) {
    return () => {
      onSubmit?.(type);
    };
  }

  return <div className={className}>
    <RegisterButton onClick={createOnClickHandler('permanent')}>
      {t('login.register_type.permanent')}
    </RegisterButton>
    <ButtonDivider />
    <RegisterButton onClick={createOnClickHandler('temporary')}>
      {t('login.register_type.temporary')}
    </RegisterButton>
  </div>;
};
