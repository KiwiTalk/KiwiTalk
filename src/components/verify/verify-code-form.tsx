import React, {ChangeEvent, useEffect, useState} from 'react';
import Color from '../../assets/colors/theme';
import styled from 'styled-components';
import logo from '../../assets/images/text_logo.svg';
import Input from '../common/input';
import Dialpad from '../../assets/images/dialpad.svg';
import DialpadDisabled from '../../assets/images/dialpad_disabled.svg';
import {AuthApiStruct} from 'node-kakao';

const Wrapper = styled.div`
  width: 100%;
  padding-left: 47px;
  padding-top: 80px;
  box-sizing: border-box;
`;

const Form = styled.form`
  width: 280px;
  display: flex;
  flex-direction: column;
`;

const Button = styled.button`
  width: 280px;
  height: 45px;
  box-shadow: 0px 4px 20px rgba(26, 60, 68, 0.07);
  border: none;
  border-radius: 12px;
  background: ${Color.BUTTON};
  color: #FFFFFF;
  font-weight: 600;
  font-size: 12px;
  user-select: none;
  cursor: pointer;

  :hover:active {
    background: ${Color.BUTTON_HOVER};
  }

  :focus:active {
    outline:none;
  }

  :disabled {
    background: #F2F2F3;
    border: 1px solid #BFBDC1;
    box-shadow: 0px 4px 20px rgba(26, 60, 68, 0.07);
    border-radius: 12px;
    color: #BFBDC1;
    cursor: not-allowed;
  }
`;

const PreviousLink = styled.a`
  font-family: NanumBarunGothic;
  font-style: normal;
  font-weight: normal;
  font-size: 10px;
  line-height: 11px;
  width: 280px;
  align-items: center;
  text-align: center;
  color: rgba(0, 0, 0, 0.45);
  text-decoration: none;
  margin-top: 16px;
  user-select: none;
`;

const VerifyCodeForm: React.FC<{
    onSubmit: (passcode: string, permanent: boolean) => void
}> = ({onSubmit}) => {
  const [passcode, setPasscode] = useState('');
  useEffect(() => {
    if (passcode.length >= 4) {
      onSubmit(passcode, true);
    }
  }, [passcode]);

  return (
    <Form>
        <Input placeholder={
          '인증 번호를 입력해주세요.'
        } icon={
          Dialpad
        } disabledIcon={
          DialpadDisabled
        } value={
          passcode
        } maxLength={
          4
        }
        onChange={
          (event: ChangeEvent<HTMLInputElement>) => {
            setPasscode(event.target.value);
          }
        }/>
      </Form>
  );
};

export default VerifyCodeForm;
