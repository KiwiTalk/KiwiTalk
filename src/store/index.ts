import { configureStore as _configureStore } from '@reduxjs/toolkit';

import { reducers } from '../reducers';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function configureStore() {
  return _configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false, }),
  });
}
