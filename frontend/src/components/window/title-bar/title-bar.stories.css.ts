import { style } from '@vanilla-extract/css';

export const titleBar = style({
  display: 'flex',
  outline: '1px solid black',
  fontSize: '0.8em',
  height: 20,
});

export const titleBarControl = style({
  color: 'rgba(0, 0, 0, 0.5)',
  marginLeft: 'auto',
});

export const titleBarTitle = style({
  padding: '0px 0.5rem',
  userSelect: 'none',
});
