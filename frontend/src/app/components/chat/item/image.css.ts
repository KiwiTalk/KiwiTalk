import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  position: 'relative',
});

export const image = style({
  width: '100%',

  borderRadius: '50%',
  objectFit: 'cover',
});

export const avatar = style({
  width: '100%',
  height: '100%',

  objectFit: 'cover',
});

export const avatarContainer = style({
  width: '100%',
  height: '100%',

  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 50%), 1fr))',
  gridAutoRows: '1fr',

  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: 'gray',
});

export const fallback = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  fontSize: 18,
  fontWeight: 600,

  borderRadius: '50%',
  backgroundColor: 'lightgray',
  color: 'red',
});

export const badge = style({
  position: 'absolute',
  bottom: 0,
  right: 0,

  width: 8,
  height: 8,
  border: 'solid 2px white',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '50%',
  backgroundColor: 'red',
});
