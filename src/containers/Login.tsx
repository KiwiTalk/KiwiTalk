import React, {useState} from 'react';
import { Redirect } from 'react-router-dom';
import { IpcRendererEvent } from 'electron'
import { getIpcRenderer } from '../functions/electron';

import LoginBackground from '../components/Login/LoginBackground';
import LoginForm from '../components/Login/LoginForm';

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
    <LoginBackground>
      <LoginForm onSubmit={onSubmit}/>
    </LoginBackground>
  )
};

export default Login;
