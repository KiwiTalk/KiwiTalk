import { style } from '@vanilla-extract/css';

export const titleBar = style({
  position: 'relative',
  display: 'flex',
  width: '100%',

  background: '#FFFFFF',
});

export const control = style({
  marginLeft: 'auto',

  color: 'rgba(0, 0, 0, .5)',
});

export const contentContainer = style({
  width: '100%',
  height: '100%',

  display: 'flex',

  flexDirection: 'row',
});

export const windowContainer = style({
  display: 'flex',

  background: '#DFDEE0',

  flexDirection: 'column',

  width: '100%',
  height: '100%',
});

export const logoText = style({
  margin: 'auto 4px',
});
