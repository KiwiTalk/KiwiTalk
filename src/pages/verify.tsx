import React, {useEffect, useState} from 'react';
import VerifyCode from '../components/verify/verify-code';
import styled from 'styled-components';
import {Redirect} from 'react-router-dom';
import {AuthStatusCode, TalkClient, WebApiStatusCode} from 'node-kakao';
import constants from '../constants';

const Wrapper = styled.div`
width: 100%;
height: 100vh;
background: linear-gradient(119.36deg, #FFFFFF 0%, #FFFFFF 0.01%, #FFFAE0 100%);
`;

const talkClient: TalkClient = constants.TalkClient;

const Verify = (): JSX.Element => {
  const [redirect, setRedirect] = useState('');

  const onSubmit = async (passcode: string) => {
    const {email, password, saveEmail, autoLogin, force} = constants.loginData;

    try {
      const {status} = await talkClient.Auth.registerDevice(
          passcode,
          email,
          password,
          true,
      );

      switch (status) {
        case WebApiStatusCode.SUCCESS:
          alert('인증 성공');

          await constants.TalkClient.logout();
          await constants.loginFunction(talkClient, email, password, {
            saveEmail,
            autoLogin,
            force,
          });
          // TODO: try - catch 넣어서 다른 기기 접속 중인지 확인 필요

          setRedirect('chat');
          break;
        case AuthStatusCode.INCORRECT_PASSCODE:
          alert('인증 번호가 틀렸습니다.');
          break;
        default:
          alert(`알 수 없는 에러가 발생했습니다. 에러코드: ${status}`);
          break;
      }
    } catch (err) {
      alert(`알 수 없는 에러가 발생했습니다. 에러: ${err}`);
    }
  };

  useEffect(() => {
    talkClient.Auth.requestPasscode(
        constants.loginData.email,
        constants.loginData.password,
        true,
    ).then();
  }, []);

  return redirect ? <Redirect to={redirect}/> : (
        <Wrapper>
          <VerifyCode onSubmit={onSubmit}/>
        </Wrapper>
    );
};

export default Verify;
