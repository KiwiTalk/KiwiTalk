import { createVar, style } from '@vanilla-extract/css';

export const outer = style({
  width: '100%',

  overflow: 'auto',
});

export const inner = style({
  width: '100%',
  height: 'fit-content',
});

export const gap = createVar();
export const placeholer = style({
  vars: {
    gap: '0px',
  },

  height: gap,
});
