import { style } from '@vanilla-extract/css';

export const container = style({
  margin: 'auto',
  padding: '1rem',

  border: '1px solid #DFDEE0',
  borderRadius: '8px',

  width: 'max-content',

  color: 'gray',

  textAlign: 'center',

  userSelect: 'none',
});

export const infoIcon = style({
  width: '4rem',
  height: '4rem',

  paddingBottom: '1rem',
});

export const text = style({
  marginBottom: 0,
});
