import { createVar, style } from '@vanilla-extract/css';

export const width = createVar();
export const height = createVar();
export const ratio = createVar();
export const emoticon = style({
  minWidth: '150px',

  width: 'fit-content',
  height: 'fit-content',

  maxWidth: `min(${width}, 100%)`,
  maxHeight: `min(${height}, 100%)`,

  aspectRatio: ratio,
  userSelect: 'none',
  WebkitUserDrag: 'none',
});
