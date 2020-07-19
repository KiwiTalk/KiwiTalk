import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import { LoginTokenStruct, TalkClient, AuthStatusCode, WebApiStatusCode } from 'node-kakao/dist';

import LoginBackground from '../components/login/login-background';
import LoginForm from '../components/login/login-form';

import { LoginErrorReason } from '../constants';

const nwGlobal = (nw as any).global;

const talkClient: TalkClient = nwGlobal.talkClient;

type LoginOption = {
    saveEmail: boolean
    autoLogin: boolean
    force?: boolean
}

// public 폴더로 이동시 헤더가 수정되서 제대로 작동하지 않음

async function login (
    client: TalkClient,
    email: string,
    password: string,
    { saveEmail, autoLogin, force }: LoginOption
) {
    return new Promise(async (resolve, reject) => {
        await nwGlobal.login.setEmail(saveEmail ? email : '');
        await nwGlobal.login.setAutoLogin(autoLogin);

        try {
            await client.login(email, password, !!force);

            if (autoLogin) {
                // @ts-ignore
                /*nwGlobal.setAutoLoginEmail(talkClient.getLatestAccessData().autoLoginEmail)
                talkClient.ApiClient.requestLoginToken().then((loginToken) => {
                    // @ts-ignore
                    nwGlobal.setAutoLoginToken(loginToken);
                });*/
            }

            resolve(WebApiStatusCode.SUCCESS);
        } catch (error) {
            const status: number = error.status;
            const reason = LoginErrorReason.get(status);
            const message = error.message;

            reject({
                status,
                reason,
                message,
            });
        }
    })
}

nwGlobal.login.login = login;

// src 폴더안에서 등록해야 제대로 작동함.

export const Login = () => {
    const [redirect, setRedirect] = useState('');

    const onSubmit = async (email: string, password: string, saveEmail: boolean, autoLogin: boolean, force = false) => {
        try {
            await nwGlobal.login.login(talkClient, email, password, {
                saveEmail,
                autoLogin,
                force,
            });

            alert('로그인 성공');
            setRedirect('chat');
        } catch (error) {
            switch (error.status) {
                case AuthStatusCode.DEVICE_NOT_REGISTERED:
                    nwGlobal.login.data = {
                        email,
                        password,
                        saveEmail,
                        autoLogin,
                        force
                    };

                    setRedirect('verify');
                    break;
                case AuthStatusCode.ANOTHER_LOGON:
                    let result = window.confirm('이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?');

                    if (result) nwGlobal.login.login(talkClient, email, password, {
                        saveEmail,
                        autoLogin,
                        force: true,
                    });
                    break;
                default:
                    if (error.message) alert(`status: ${error.status}\n reason: ${error.reason}\n meessage : ${error.message}`);
                    else if (error.reason) alert(`reason: ${error.reason}`);
                    else alert(`알 수 없는 오류가 발생했습니다. 오류 코드: ${error.status}`);
            }
        }
    }

    const autoLogin = async () => {
        const autoLogin = await nwGlobal.login.isAutoLogin();

        if (autoLogin) {
            try {
                const loginToken = await nwGlobal.login.getAutoLoginToken() as LoginTokenStruct;
                const autoLoginEmail = await nwGlobal.login.getAutoLoginEmail();
                const uuid = await nwGlobal.util.getUUID();

                try {
                    await talkClient.loginToken(autoLoginEmail, loginToken.token, uuid);
                } catch (reason) {
                    if (reason.status === AuthStatusCode.ANOTHER_LOGON) {
                        let result = window.confirm('이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?');
                        if (result) {
                            talkClient.loginToken(autoLoginEmail, loginToken.token, uuid, true);
                        }
                    } else throw reason;
                }

                alert('자동로그인 했습니다.');
                setRedirect('chat');
            } catch (e) {
                alert('자동로그인에 실패했습니다: ' + e);
            }
        }
    }

    // nwGlobal.global.index = index;

    useEffect(() => {
        autoLogin();
    }, []);

    return redirect ? <Redirect to={redirect}/> : (
        <LoginBackground>
            <LoginForm onSubmit={onSubmit}/>
        </LoginBackground>
    )
};

export default Login;
