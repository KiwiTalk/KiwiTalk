import { style } from '@vanilla-extract/css';

export const windowContainer = style({
  width: '100%',
  height: '100%',
});

export const titleBar = style({
  display: 'flex',
  position: 'absolute',
  width: '100%',
  top: 0,

  zIndex: 999999,
});

export const control = style({
  marginLeft: 'auto',
  backgroundColor: 'rgba(0, 0, 0, .25)',
  color: 'white',

  borderBottomLeftRadius: 3,
});

export const screen = style({
  width: '100%',
  height: '100%',
});
