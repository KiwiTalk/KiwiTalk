import localForage from 'localforage';
import { LoginTokenStruct } from 'node-kakao/dist';

export async function getEmail (): Promise<string> {
    try {
        const email: string | null = await localForage.getItem('email');

        if (email) return email;
        else return '';
    } catch (e) {
        return '';
    }
}

export async function setEmail (email: string) {
    try {
        await localForage.setItem('email', email);
    } catch(error) {
        console.log(error);
    }
}

export async function isAutoLogin (): Promise<boolean> {
    try {
        return !!(await localForage.getItem('autoLogin'));
    } catch (error) {
        return false
    }
}

export async function setAutoLogin  (autoLogin: boolean) {
    try {
        await localForage.setItem('autoLogin', autoLogin);
    } catch (error) {
        console.log(error);
    }
}

export async function setAutoLoginEmail (autoLoginEmail: string) {
    try {
        await localForage.setItem('autoLoginEmail', autoLoginEmail);
    } catch (error) {
        console.log(error);
    }
}

export async function getAutoLoginEmail (): Promise<string> {
    try {
        const autoLoginEmail: string | null = await localForage.getItem('autoLoginEmail');

        if (autoLoginEmail)return autoLoginEmail;
        else return '';
    } catch (e) {
        return '';
    }
}

export async function setAutoLoginToken (autoLoginToken: LoginTokenStruct) {
    try {
        await localForage.setItem('autoLoginToken', autoLoginToken);
    } catch (error) {
        console.log(error);
    }
}

export async function getAutoLoginToken (): Promise<LoginTokenStruct | null> {
    try {
        return (await localForage.getItem('autoLoginToken')) as LoginTokenStruct | null;
    } catch (e) {
        return null;
    }
}

export default {
    getEmail,
    setEmail,
    isAutoLogin,
    setAutoLogin,
    setAutoLoginEmail,
    getAutoLoginEmail,
    setAutoLoginToken,
    getAutoLoginToken,
};
