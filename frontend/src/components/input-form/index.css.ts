import { style } from '@vanilla-extract/css';

export const input = style({
  border: 'none',
  outline: 'none',

  color: 'inherit',

  background: 'none',

  padding: 0,

  flex: 1,

  transition: 'all 0.25s',

  selectors: {
    '&::placeholder': {
      color: '#BFBDC1',
    },
  },
});

export const inputBox = style({
  background: '#FFFFFF',
  outline: 'none',

  display: 'inline-block',

  color: '#1E2019',

  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(26, 60, 68, 0.07)',

  selectors: {
    '&[data-activated=false]': {
      color: '#BFBDC1',
    },
    '&[data-activated=false]:hover': {
      color: '#999999',
    },
    '&[data-disabled=true]': {
      background: '#F2F2F3',
      color: '#BFBDC1',
      outline: '1px solid #BFBDC1',
    },
  },
});

export const innerWrapper = style({
  display: 'flex',
  alignItems: 'center',

  padding: '12px 9px',
});

export const iconContainer = style({
  width: '1.25em',
  height: '1.25em',

  overflow: 'hidden',

  lineHeight: 1,

  marginRight: 9,

  transition: 'all 0.25s',
});
