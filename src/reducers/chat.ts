import { createSlice } from '@reduxjs/toolkit';

export interface ChatReducerType {
  select: string;
}

const slice = createSlice({
  name: '@chat',
  initialState: {
    select: '',
  },
  reducers: {
    selectChannel: (state, action) => {
      state.select = action.payload;
    },
  },
});

export const {
  selectChannel,
} = slice.actions;

export default slice.reducer;
