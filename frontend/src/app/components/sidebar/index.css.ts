import { style } from '@vanilla-extract/css';

export const list = style({
  margin: 0,

  padding: 0,
  listStyleType: 'none',
});

export const bottomButtonList = style({
  marginTop: 'auto',
});

export const listItem = style({
  margin: 0,

  color: '#BFBDC1',

  transition: 'color 0.25s',

  selectors: {
    '&:hover': {
      color: '#1E2019',
    },
    '&[data-activated=true]': {
      color: '#1E2019',
    },
  },
});

export const iconButton = style({
  all: 'unset',

  cursor: 'pointer',

  lineHeight: 0,

  width: '1.5em',
  padding: '1.125em',
});

export const container = style({
  display: 'inline-block',
});

export const inner = style({
  display: 'flex',
  flexDirection: 'column',

  width: '100%',
  height: '100%',
});
