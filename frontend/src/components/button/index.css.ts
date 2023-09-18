import { style } from '@vanilla-extract/css';

export const button = style({
  background: '#1E2019',
  color: '#FFFFFF',
  boxShadow: '0px 4px 20px rgba(26, 60, 68, 0.07)',
  borderRadius: 12,
  userSelect: 'none',
  border: 'none',
  outline: 'none',

  padding: '16px 16px',

  fontWeight: 600,

  transition: 'all 0.25s',

  selectors: {
    '&:hover:enabled': {
      background: '#30323D',
    },
    '&:focus': {
      outline: 'none',
    },
    '&:active:enabled': {
      background: '#4D5061',
    },
    '&:disabled': {
      background: '#F2F2F3',
      color: '#BFBDC1',
      outline: '1px solid #BFBDC1',
    },
  },
});
