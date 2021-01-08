import { createSlice } from '@reduxjs/toolkit';

export interface AuthReducerType {
  uuid: string;
  email: string;
  password: string;
  saveEmail: boolean;
  autoLogin: boolean;
}

const slice = createSlice({
  name: '@auth',
  initialState: {
    uuid: '',
    email: '',
    password: '',
    saveEmail: false,
    autoLogin: false,
  },
  reducers: {
    setEmail(state, action) {
      state.email = action.payload;
    },

    setPassword(state, action) {
      state.email = action.payload;
    },

    setLoginOption(state, action) {
      const { saveEmail, autoLogin } = action.payload;

      if (saveEmail) state.saveEmail = saveEmail;
      if (autoLogin) state.autoLogin = autoLogin;
    },
  },
});

export const {
  setEmail,
  setPassword,
  setLoginOption,
} = slice.actions;

export default slice.reducer;
