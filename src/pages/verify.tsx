import React, { useEffect, useState } from 'react';
import VerifyCode from "../components/verify/verify-code";
import styled from 'styled-components';
import { Redirect } from 'react-router-dom';
import { KakaoAPI, TalkClient } from 'node-kakao/dist';
import os from 'os';

const nwGlobal = (nw as any).global

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background: linear-gradient(119.36deg, #FFFFFF 0%, #FFFFFF 0.01%, #FFFAE0 100%);
`;

const resultText = {
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

const talkClient: TalkClient = nwGlobal.talkClient;

const Verify = () => {
    const [redirect, setRedirect] = useState('');
    const onSubmit = async (passcode: string) => {
        const uuid = await nwGlobal.getUUID()

        const { email, password, saveEmail, autoLogin, force } = nwGlobal.loginData;

        try {
            const result = await KakaoAPI.registerDevice(passcode, email, password, uuid, os.hostname(), true)

            const parsedResult = JSON.parse(result)

            switch (parsedResult.status) {
                case 0:
                    alert('인증 성공');
                    nwGlobal.login(email, password, saveEmail, autoLogin, force);
                    break;
                case -112: // 입력불가
                    alert(parsedResult.message);
                    break;
                case -111: // 틀림
                    alert(`인증 번호가 틀렸습니다.`);
                    break;
                default:
                    alert(`알 수 없는 에러가 발생했습니다. 에러: ${result}`);
                    break;
            }
        } catch (err) {
            alert(`알 수 없는 에러가 발생했습니다. 에러: ${err}`);
        }
    };

    useEffect(() => {
        nwGlobal.getUUID()
            .then((uuid: string) => {
                KakaoAPI.requestPasscode(nwGlobal.email, nwGlobal.password, uuid, os.hostname(), true)
            });
    }, [])

    return redirect ? <Redirect to={redirect}/> : (
        <Wrapper>
            <VerifyCode onSubmit={onSubmit}/>
        </Wrapper>
    )
};

export default Verify;
