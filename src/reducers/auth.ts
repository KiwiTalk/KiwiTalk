import { createSlice } from '@reduxjs/toolkit';

export interface AuthReducerType {
  uuid: string;
  email: string;
  password: string;
}

const slice = createSlice({
  name: '@auth',
  initialState: {
    uuid: '',
    email: '',
    password: '',
  },
  reducers: {
    setEmail(state, action) {
      state.email = action.payload;
    },

    setPassword(state, action) {
      state.password = action.payload;
    },
  },
});

export const {
  setEmail,
  setPassword,
} = slice.actions;

export default slice.reducer;
