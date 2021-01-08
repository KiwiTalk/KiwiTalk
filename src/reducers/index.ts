import { combineReducers } from 'redux';

import auth, { AuthReducerType } from './auth';

export interface ReducerType {
  auth: AuthReducerType;
}

export const reducers = combineReducers({
  auth,
});

export default reducers;
