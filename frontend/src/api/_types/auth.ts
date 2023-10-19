
export type AuthState = 'NeedLogin' | 'Logon';

export type LoginForm = {
  email: string,
  password: string,
  saveEmail: boolean,
  autoLogin: boolean,
}
