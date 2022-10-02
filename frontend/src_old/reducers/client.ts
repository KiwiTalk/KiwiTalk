import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthApiClient, ServiceApiClient, TalkClient } from 'node-kakao';

export interface ClientReducerType {
  talkClient?: TalkClient;
  authClient?: AuthApiClient;
  serviceClient?: ServiceApiClient;
}

const slice = createSlice({
  name: '@client',
  initialState: {} as ClientReducerType,
  reducers: {
    initTalkClient: (state, action: PayloadAction<TalkClient>) => {
      if (!state.talkClient) state.talkClient = action.payload;
    },
    initAuthClient: (state, action: PayloadAction<AuthApiClient>) => {
      if (!state.authClient) state.authClient = action.payload;
    },
    initServiceClient: (state, action: PayloadAction<ServiceApiClient>) => {
      if (!state.serviceClient) state.serviceClient = action.payload;
    },
  },
});

export const {
  initTalkClient,
  initAuthClient,
  initServiceClient,
} = slice.actions;

export default slice.reducer;
