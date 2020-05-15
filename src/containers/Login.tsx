import React, {useState} from 'react';
import { Redirect } from 'react-router-dom';
import styled from 'styled-components';
import Color from '../assets/javascripts/color';
import kiwi from '../assets/images/kiwi.svg';
import LoginForm from '../components/Login/LoginForm';
import { IpcRendererEvent } from 'electron'

import { getIpcRenderer } from '../functions/electron';

const Wrapper = styled.div`
width: 100%;
height: 100vh;
background: linear-gradient(128.19deg, ${Color.THEME1} 30.01%, ${Color.THEME2} 47.2%);
`;

const Kiwi = styled.img`
position: fixed;
width: 100%;
height: 100%;
right: -30%;
bottom: -50%;
user-select: none;
`;

const VersionText = styled.span`
position: fixed;
left: 13px;
bottom: 10px;
font-size: 8px;
z-index: 2;
user-select: none;
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

const Login = () => {
  const [redirect, setRedirect] = useState('');
  const onSubmit = (email: string, password: string) => {
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
    ipcRenderer.send('login', email, password, true)
  };

  return redirect ? <Redirect to={redirect}/> : (
    <Wrapper>
      <LoginForm onSubmit={onSubmit}/>
      <Kiwi src={kiwi} alt={'kiwi'}/>
      <VersionText><b>Kiwitalk</b> ver 0.0.1</VersionText>
    </Wrapper>
  )
};

export default Login;
