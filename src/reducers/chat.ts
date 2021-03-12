import { createSlice } from '@reduxjs/toolkit';

export interface ChatReducerType {
  select: string;
  input: {
    files: File[];
    reply: string | null;
  }
}

const initialState: ChatReducerType = {
  select: '0',
  input: {
    files: [],
    reply: null,
  },
};

const slice = createSlice({
  name: '@chat',
  initialState,
  reducers: {
    selectChannel: (state, action) => {
      state.select = action.payload;

      state.input.reply = null;
    },

    setInput: (state, action) => {
      const { text, files, reply } = action.payload;

      if (files) state.input.files = files;
      if (reply) state.input.reply = reply;
    },

    clearInput: (state) => {
      state.input = {
        files: [],
        reply: null,
      };
    },

    addFile: (state, action) => {
      state.input.files.push(action.payload);
    },

    addFiles: (state, action) => {
      state.input.files.push(...action.payload);
    },

    clearFile: (state) => {
      state.input.files = [];
    },

    setReply: (state, action) => {
      state.input.reply = action.payload;
    },
  },
});

export const {
  selectChannel,
  setInput,
  clearInput,
  addFile,
  addFiles,
  clearFile,
  setReply,
} = slice.actions;

export default slice.reducer;
