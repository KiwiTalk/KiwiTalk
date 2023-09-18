import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  alignItems: 'center',
});

export const iconBox = style({
  width: '1.75rem',
  height: '1.75rem',

  padding: '0.25rem',

  boxSizing: 'border-box',

  color: '#1E2019',

  border: '1px solid #1E2019',
  borderRadius: '50%',

  textAlign: 'center',
  lineHeight: '0px',

  marginRight: '0.5rem',
});
