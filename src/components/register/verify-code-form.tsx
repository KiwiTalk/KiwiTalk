import React, {ChangeEvent, useEffect, useState} from 'react';
import Color from '../../assets/colors/theme';
import styled from 'styled-components';
import logo from '../../assets/images/text_logo.svg';
import Input from '../common/input';
import Dialpad from '../../assets/images/dialpad.svg';
import DialpadDisabled from '../../assets/images/dialpad_disabled.svg';
import {AuthApiStruct} from 'node-kakao';

const Form = styled.form`
  width: 280px;
  display: flex;
  flex-direction: column;
`;

const VerifyCodeForm: React.FC<{
    onSubmit: (passcode: string) => void
}> = ({onSubmit}) => {
  return (
    <Form>
        <Input placeholder={
          '인증 번호를 입력해주세요.'
        } icon={
          Dialpad
        } disabledIcon={
          DialpadDisabled
        } maxLength={
          4
        }
        onChange={
          (event: ChangeEvent<HTMLInputElement>) => {
            let passcode = event.target.value;
            if (passcode.length >= 4) {
              onSubmit(passcode);
            }
          }
        }/>
      </Form>
  );
};

export default VerifyCodeForm;
