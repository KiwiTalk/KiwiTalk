import { createVar, style } from '@vanilla-extract/css';

export const width = createVar();
export const height = createVar();
export const emoticon = style({
  width,
  height,
});
