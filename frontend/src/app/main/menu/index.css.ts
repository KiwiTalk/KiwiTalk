import { style } from '@vanilla-extract/css';

export const appSideMenu = style({
  backgroundColor: '#F2F2F3',

  borderRadius: '0.5rem 0px 0px 0px',

  height: '100%',
});

export const sideButton = style({
  all: 'unset',

  marginLeft: '0.5rem',
  padding: '0.25rem',

  width: '2rem',
  height: '2rem',

  boxSizing: 'border-box',

  borderRadius: '50%',

  color: '#1E2019',

  transition: 'background 0.25s',

  selectors: {
    '&:hover': {
      background: 'rgba(0, 0, 0, 0.09)',
    },
  },
});
