import { createStore } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

import { reducers } from '../reducers';

const persistConfig = {
  key: 'root',
  storage: storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function configureStore(): Record<string, any> {
  const store = createStore(persistedReducer);
  const persistor = persistStore(store);

  return { store, persistor };
}
