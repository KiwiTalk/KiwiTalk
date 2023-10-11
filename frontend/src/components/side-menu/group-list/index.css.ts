import { style } from '@vanilla-extract/css';

export const container = style({
  backgroundColor: 'rgba(255, 255, 255, 0.5)',

  border: '1px solid #DFDEE0',
  borderRadius: '0.5rem',
  overflow: 'hidden',
});

export const header = style({
  padding: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  outline: '1px solid #DFDEE0',
});

export const name = style({
  userSelect: 'none',

  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const countText = style({
  userSelect: 'none',

  color: '#BFBDC1',
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
});

export const expandMoreIcon = style({
  width: '1.5rem',
  height: '1.5rem',

  marginLeft: 'auto',

  color: '#BFBDC1',

  transition: 'transform 0.25s',

  selectors: {
    '&[data-expanded=true]': {
      transform: 'rotate(0.5turn)',
    },
  },
});
