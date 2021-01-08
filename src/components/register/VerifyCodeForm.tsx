import React, { ChangeEvent } from 'react';

import styled from 'styled-components';

import Dial from '../../assets/images/dialpad.svg';
import DialDisabled from '../../assets/images/dialpad_disabled.svg';
import Strings from '../../constants/Strings';

import Input from '../common/input';

const Form = styled.form`
  width: 280px;

  display: flex;
  flex-direction: column;
`;

interface VerifyCodeFormProps {
  onSubmit: (passcode: string) => void;
}

const VerifyCodeForm: React.FC<VerifyCodeFormProps> = ({ onSubmit }) => {
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value.length >= 4) {
      onSubmit(value);
    }
  };

  return (
    <Form>
      <Input
        placeholder={Strings.Auth.WRITE_PASSCODE}
        icon={Dial}
        disabledIcon={DialDisabled}
        maxLength={4}
        onChange={onChange}/>
    </Form>
  );
};

export default VerifyCodeForm;
