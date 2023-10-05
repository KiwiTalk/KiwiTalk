import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'grid',
  gridTemplateColumns: '24px 1fr auto',
  gridTemplateRows: 'auto auto',

  width: '100%',
  height: 40,
});


