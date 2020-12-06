import React, {ChangeEvent, useState} from 'react';
import Color from '../../assets/colors/theme';
import styled from 'styled-components';
import logo from '../../assets/images/text_logo.svg';
import {Link} from 'react-router-dom';
import Input from '../common/input';
import Dialpad from '../../assets/images/dialpad.svg';
import DialpadDisabled from '../../assets/images/dialpad_disabled.svg';
import { AuthApiStruct } from 'node-kakao';

const Wrapper = styled.div`
  width: 100%;
  padding-left: 47px;
  padding-top: 80px;
  box-sizing: border-box;
`;

const TitleWrapper = styled.div`
  margin-bottom: 50px;
  color: #000000;
  user-select: none;
`;

const Logo = styled.img`
  -webkit-user-drag: none;
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

const PreviousLink = styled(Link)`
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

const VerifyCode: React.FC<{
    registerDevice: (passcode: string, permanent: boolean) => Promise<AuthApiStruct>,
    passcodeDone: () => void
}> = ({registerDevice, passcodeDone}) => {
  const [passcode, setPasscode] = useState('');
  if (passcode.length >= 4) {
    registerDevice(passcode, true)
    .then((apiStruct) => {
      passcodeDone();
    })
    .catch((err) => {
      alert(`기기 등록 실패 : ${err}`);
    })
  }

  return (
    <Wrapper>
      <TitleWrapper>
        <Logo src={logo} alt={'logo'}/>
      </TitleWrapper>
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
      <PreviousLink to='/index'>처음으로 돌아가기</PreviousLink>
    </Wrapper>
  );
};

export default VerifyCode;
