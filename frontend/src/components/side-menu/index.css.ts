import { style } from '@vanilla-extract/css';

export const container = style({
  padding: '1rem 1rem 0px 1rem',

  boxSizing: 'border-box',
});

export const head = style({
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
  margin: '1rem 0px 0px 0px',
  padding: '0px',

  listStyleType: 'none',
});

export const contentItem = style({
  marginTop: '0.5rem',
  padding: '0px',
});
