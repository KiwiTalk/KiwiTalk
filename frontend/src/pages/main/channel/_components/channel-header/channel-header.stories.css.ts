import { style } from '@vanilla-extract/css';

export const background = style({
  position: 'relative',

  width: '900px',
  height: '300px',

  background: `
    linear-gradient(217deg, rgba(125,0,0,.8), rgba(125,0,0,0) 70.71%),
    linear-gradient(127deg, rgba(0,125,0,.8), rgba(0,125,0,0) 70.71%),
    linear-gradient(336deg, rgba(0,0,125,.8), rgba(0,0,125,0) 70.71%)
  `,
  padding: '12px',
  borderRadius: '10px',

  overflow: 'hidden',
});
