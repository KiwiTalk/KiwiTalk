import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: '12px',
});

export const list = style({
  minWidth: '300px',
  maxWidth: '500px',
  height: '100%',
});
