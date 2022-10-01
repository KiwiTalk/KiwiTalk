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
      state.password = action.payload;
    },

    setSaveEmail(state, action) {
      state.saveEmail = action.payload;
    },

    setAutoLogin(state, action) {
      state.autoLogin = action.payload;
    },
  },
});

export const {
  setEmail,
  setPassword,
  setSaveEmail,
  setAutoLogin,
} = slice.actions;

export default slice.reducer;
