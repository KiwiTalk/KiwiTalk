import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: '12px',
});

export const sidebarWrapper = style({
  padding: '12px',
  paddingRight: '0',
});
