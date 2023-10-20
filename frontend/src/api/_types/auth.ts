
export type AuthState = 'NeedLogin' | 'Logon';

export type LoginForm = {
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
};

export type LoginDetailForm = LoginForm & {
  profile: string;
  name: string;
};

export type LoginResult = { type: 'Success'; }
  | { type: 'NeedRegister' }
  | { type: 'Error', key: string; forced?: boolean, detail?: unknown; };

/** @deprecated */
export type LogoutReason = {
  type: 'Kickout';
  reasonId: number;
} | {
  type: 'Error';
  err: unknown
} | {
  type: 'Disconnected';
} | {
  type: 'Logout';
};
