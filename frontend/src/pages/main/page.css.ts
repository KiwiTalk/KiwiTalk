import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',
  minHeight: '0px',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
});

export const sidebarWrapper = style({
  margin: '12px',
});
