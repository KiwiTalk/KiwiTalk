import { style } from '@vanilla-extract/css';

export const appSideBar = style({
  backgroundColor: '#FFFFFF',
});

export const sideMenuContainer = style({
  display: 'flex',

  flexDirection: 'column',

  minWidth: '160px',

  width: '25%',
  height: '100%',

  backgroundColor: '#FFFFFF',
});

export const chatWindowPlaceholder = style({
  margin: 'auto auto',

  color: '#4D5061',
  fontSize: '0.875rem',
  textAlign: 'center',

  userSelect: 'none',
});
