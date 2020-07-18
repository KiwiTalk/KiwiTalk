import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';

import LoginBackground from '../components/login/login-background';
import LoginForm from '../components/login/login-form';
import {LoginError, LoginTokenStruct, TalkClient} from 'node-kakao/dist';

const nwGlobal = (nw as any).global;
const talkClient: TalkClient = nwGlobal.talkClient;

const Login = () => {
    const [redirect, setRedirect] = useState('');

    const login = async (email: string, password: string, saveEmail: boolean, autoLogin: boolean, force: boolean = false) => {
        await nwGlobal.setEmail(saveEmail ? email : '');
        await nwGlobal.setAutoLogin(autoLogin);

        const uuid = await nwGlobal.getUUID();
        talkClient.login(email, password, uuid, force).then(() => {
            if (autoLogin) {
                // @ts-ignore
                /*nw.global.setAutoLoginEmail(talkClient.getLatestAccessData().autoLoginEmail)
                talkClient.ApiClient.requestLoginToken().then((loginToken) => {
                    // @ts-ignore
                    nw.global.setAutoLoginToken(loginToken);
                });*/
            }
            alert('로그인 성공');
            setRedirect('chat');
        }).catch((reason: LoginError) => {
            switch (reason.status) {
                case -100: // 인증이 필요
                    nwGlobal.loginData = {
                        email: email,
                        password: password,
                        saveEmail: saveEmail,
                        autoLogin: autoLogin,
                        force: force
                    };
                    setRedirect('verify');
                    break;
                case -101:
                    let result = window.confirm('이미 다른 기기에 접속되어 있습니다.\n다른 기기의 연결을 해제하시겠습니까?');
                    if (result) {
                        login(email, password, saveEmail, autoLogin, true);
                    }
                    break;
                case 12:
                    let cause = reason.message;
                    if (cause) {
                        alert(cause);
                    } else {
                        alert('오류가 발생했습니다. 오류 코드: -12');
                    }
                    break;
                default:
                    if (reason.message !== undefined) {
                        alert(`${reason.status} : ${reason.message}`);
                    } else if (errorReason[reason.status] !== undefined) {
                        alert(errorReason[reason.status]);
                    } else {
                        alert(`알 수 없는 오류가 발생했습니다. 오류 코드: ${reason.status}`);
                    }
                    break;
            }
        });
    };

    nwGlobal.global.login = login

    const onSubmit = login

    useEffect(() => {
        (async () => {
            const autoLogin = await nwGlobal.isAutoLogin();
            if (autoLogin) {
                try {
                    const loginToken = await nwGlobal.getAutoLoginToken() as LoginTokenStruct;
                    const autoLoginEmail = await nwGlobal.getAutoLoginEmail();
                    const uuid = await nwGlobal.getUUID();
                    console.log(loginToken, autoLoginEmail, uuid)
                    try {
                        await talkClient.loginToken(autoLoginEmail, loginToken.token, uuid)
                    } catch (reason) {
                        if (reason.status === -101) {
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
        })()
    }, [])

    return redirect ? <Redirect to={redirect}/> : (
        <LoginBackground>
            <LoginForm onSubmit={onSubmit}/>
        </LoginBackground>
    )
};

export default Login;
