import { createVar, style } from '@vanilla-extract/css';

export const background = createVar();
export const color = createVar();

export const control = style({
  backgroundColor: background,
  color,
});
