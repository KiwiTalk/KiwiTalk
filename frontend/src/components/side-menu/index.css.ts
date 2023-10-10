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

export const contentList = style({
  all: 'unset',
  listStyle: 'none',
  padding: '0px 1rem 1rem 1rem',
  overflowY: 'scroll',
  flex: 1,
  minHeight: 0,
});

export const contentItem = style({
  marginTop: '0.5rem',
  padding: '0px',
});
