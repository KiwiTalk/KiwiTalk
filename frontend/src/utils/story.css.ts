import { createVar, style } from '@vanilla-extract/css';

export const width = createVar();
export const height = createVar();
export const backgroundColor = createVar();

export const storyContainer = style({
  width,
  height,
  backgroundColor,

  border: '1px solid #000000',
});
