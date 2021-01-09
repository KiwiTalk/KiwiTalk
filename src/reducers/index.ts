import { combineReducers } from 'redux';

import auth, { AuthReducerType } from './auth';
import chat, { ChatReducerType } from './chat';

export interface ReducerType {
  auth: AuthReducerType;
  chat: ChatReducerType;
}

export const reducers = combineReducers({
  auth,
  chat,
});

export default reducers;
