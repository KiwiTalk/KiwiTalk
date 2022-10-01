import { combineReducers } from 'redux';

import auth, { AuthReducerType } from './auth';
import chat, { ChatReducerType } from './chat';
import client, { ClientReducerType } from './client';

export interface ReducerType {
  auth: AuthReducerType;
  chat: ChatReducerType;
  client: ClientReducerType;
}

export const reducers = combineReducers({
  auth,
  chat,
  client,
});

export default reducers;
