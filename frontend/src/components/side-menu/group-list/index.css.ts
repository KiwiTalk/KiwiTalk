import { style } from '@vanilla-extract/css';

export const header = style({
  padding: '0.5rem',
});

export const name = style({
  userSelect: 'none',
  marginRight: '0.5rem',

  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const countText = style({
  userSelect: 'none',

  color: '#BFBDC1',
});

export const itemList = style({
  borderTop: '1px solid #DFDEE0',

  margin: 0,

  padding: 0,
  listStyleType: 'none',
});

export const expandMoreIcon = style({
  width: '1.5rem',
  height: '1.5rem',

  alignSelf: 'center',

  marginLeft: 'auto',

  color: '#BFBDC1',

  transition: 'transform 0.25s',

  selectors: {
    '&[data-expanded=true]': {
      transform: 'rotate(0.5turn)',
    },
  },
});
