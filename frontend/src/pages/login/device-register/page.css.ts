import { style } from '@vanilla-extract/css';

export const container = style({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
});

export const tool = style({
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
});
