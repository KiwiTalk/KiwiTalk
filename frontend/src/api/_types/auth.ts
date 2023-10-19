
export type AuthState = 'NeedLogin' | 'Logon';

export type LoginForm = {
  email: string,
  password: string,
  saveEmail: boolean,
  autoLogin: boolean,
}

/** @deprecated */
export type LogoutReason = {
  type: 'Kickout',
  reasonId: number,
} | {
  type: 'Error',
  err: unknown
} | {
  type: 'Disconnected',
} | {
  type: 'Logout',
};
