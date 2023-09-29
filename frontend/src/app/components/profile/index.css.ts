import { style } from '@vanilla-extract/css';

export const container = style({
  background: '#FFFFFF',

  display: 'flex',

  padding: '0.75rem',

  alignItems: 'center',
});

export const imageContainer = style({
  border: '1px solid #DFDEE0',
  borderRadius: '50%',

  boxSizing: 'border-box',

  overflow: 'hidden',

  width: '2.25rem',
  height: '2.25rem',
});

export const image = style({
  width: '100%',
  height: '100%',

  objectFit: 'cover',
});

export const info = style({
  all: 'unset',

  marginLeft: '0.75rem',
  marginRight: 'auto',
});

export const name = style({
  color: '#1E2019',

  margin: 0,

  fontWeight: 'bold',
  fontSize: '1rem',
});

export const contact = style({
  color: '#4D5061',

  margin: 0,

  fontSize: '0.75rem',
});

export const editButton = style({
  all: 'unset',

  cursor: 'pointer',

  width: '2.25rem',
  height: '2.25rem',

  textAlign: 'center',
  lineHeight: 0,

  color: '#BFBDC1',
});

export const editIcon = style({
  width: '1.25rem',
  height: '100%',
});
