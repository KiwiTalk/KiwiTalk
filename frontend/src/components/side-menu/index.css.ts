import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',

  boxSizing: 'border-box',
  minHeight: 0,
});

export const head = style({
  margin: '1rem',
  display: 'flex',

  alignItems: 'center',
});

export const name = style({
  fontSize: '1.5rem',

  fontWeight: 'bold',

  userSelect: 'none',

  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const headContainer = style({
  marginLeft: 'auto',
});

const scroll = {
  '::-webkit-scrollbar': {
    width: '1rem',
  },

  '::-webkit-scrollbar-track': {
    width: 0,
  },

  '::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgb(200, 200, 200)',
    border: 'solid 0.25rem #F2F2F3',
    borderRadius: '0.5rem',
  },
};

export const contentList = style({
  all: 'unset',
  listStyle: 'none',
  padding: '0px 0px 1rem 1rem',
  overflowY: 'scroll',
  flex: 1,
  minHeight: 0,

  ...scroll,
});

export const contentItem = style({
  marginTop: '0.5rem',
  padding: '0px',
});
