import React, { useState } from 'react';
import VerifyCode from "../components/VerifyCode/VerifyCode";
import styled from 'styled-components';
import { getIpcRenderer } from '../functions/electron';
import { IpcRendererEvent } from 'electron';
import { Redirect } from 'react-router-dom';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(119.36deg, #FFFFFF 0%, #FFFFFF 0.01%, #FFFAE0 100%);
`;

const resultText: {[key: string]: string} = {
  success: '로그인 성공',
  passcode: '인증번호 필요',
  anotherdevice: '다른 기기에서 이미 로그인됨',
  restricted: '제한된 계정입니다.',
  wrong: '아이디 또는 비밀번호가 올바르지 않습니다.',
};

interface LoginResponse {
  result: string
  errorCode?: number
}

interface PasscodeResponse {
  result: string
  error?: string
}

const Verify = () => {
  const [redirect, setRedirect] = useState('');
  const onSubmit = (passcode: string) => {
    const ipcRenderer = getIpcRenderer();
    ipcRenderer.once('login', (event: IpcRendererEvent, { result, errorCode }: LoginResponse) => {
      if (result === 'success') {
        alert('로그인 성공');
        setRedirect('chat');
      } else if (result === 'error') {
        alert(`알 수 없는 에러가 발생했습니다. 에러코드: ${ errorCode }`);
      } else if (result === 'passcode') {
        setRedirect('verify');
      } else {
        alert(resultText[result]);
      }
    })
    ipcRenderer.once('passcode', (event: IpcRendererEvent, { result, error }: PasscodeResponse) => {
      if (result === 'success') {
        alert('인증 성공');
        ipcRenderer.send('login');
      } else if (result === 'unavailable') {
        alert('인증 불가. 24시간 후에 재시도하십시오.');
      } else if (result === 'wrong') {
        alert(`인증번호가 틀렸습니다.`);
      } else if (result === 'error') {
        alert(`알 수 없는 에러가 발생했습니다. 에러: ${ error }`);
      }
    })
    ipcRenderer.send('passcode', passcode);
  };

  return redirect ? <Redirect to={redirect}/> :  (
    <Wrapper>
      <VerifyCode onSubmit={onSubmit}/>
    </Wrapper>
  )
};

export default Verify;