import React, {FormEvent} from 'react';
import styled from 'styled-components';
import Color from '../assets/javascripts/color';
import kiwi from '../assets/images/kiwi.svg';
import LoginForm from '../components/Login/LoginForm';
import { IpcRendererEvent } from 'electron'

const {ipcRenderer} = window.require('electron'); // 예외


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
`;

const VersionText = styled.span`
position: fixed;
left: 13px;
bottom: 10px;
font-size: 8px;
z-index: 2;
`;

interface LoginResponse {
  result: string
  errorCode?: number
}

const Login = () => {
  const onSubmit = (email: string, password: string) => {
    console.log(ipcRenderer)
    ipcRenderer.on('login', (event: IpcRendererEvent, { result, errorCode }: LoginResponse) => {
      if (result === 'success') {
        alert('로그인 성공');
        window.location.href = '#chat';
      } else if (result === 'passcode') {
        alert('인증번호 필요');
        // TODO
      } else if (result === 'anotherdevice') {
        alert('다른 기기에서 이미 로그인됨');
        // TODO
      } else if (result === 'restricted') {
        alert('제한된 계정입니다.');
      } else if (result === 'wrong') {
        alert('아이디 또는 비밀번호가 올바르지 않습니다.');
      } else if (result === 'error') {
        alert(`알 수 없는 에러가 발생했습니다. 에러코드: ${errorCode}`);
      }
    })
    ipcRenderer.send('login', email, password, true)
  };

  return (
    <Wrapper>
      <LoginForm onSubmit={onSubmit}/>
      <Kiwi src={kiwi} alt={'kiwi'}/>
      <VersionText><b>Kiwitalk</b> ver 0.0.1</VersionText>
    </Wrapper>
  )
};

export default Login;
