import { style } from '@vanilla-extract/css';

export const controlContainer = style({
  fontSize: 0,
  display: 'inline-block',
  verticalAlign: 'top',
  overflow: 'hidden',
});


export const controlButton = style({
  all: 'unset',

  width: '1.5rem',
  height: '1.25rem',

  textAlign: 'center',
  verticalAlign: 'middle',

  background: 'none',

  transition: 'all 0.25s',

  selectors: {
    ':hover': {
      background: 'rgba(0, 0, 0, 0.1)',
    },
  },
});

export const closeButton = style({
  ':hover': {
    background: 'rgba(255, 0, 0, 0.8)',
  },
});
