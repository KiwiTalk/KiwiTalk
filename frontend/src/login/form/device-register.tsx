import styled from 'styled-components';
import { Button } from '../../components/button';

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

export const DeviceRegisterForm: React.FC<DeviceRegisterFormProp> = ({
  onSubmit,

  className,
}) => {
  function createOnClickHandler(type: DeviceRegisterType) {
    return () => {
      onSubmit?.(type);
    };
  }

  // TODO:: Update button text
  return <div className={className}>
    <RegisterButton onClick={createOnClickHandler('permanent')}>
      내 PC 인증 받기
    </RegisterButton>
    <ButtonDivider />
    <RegisterButton onClick={createOnClickHandler('temporary')}>
      1회용 인증 받기
    </RegisterButton>
  </div>;
};
