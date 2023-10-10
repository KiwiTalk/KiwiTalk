import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
});

export const profileImageBox = style({
  margin: 8,
  borderRadius: '50%',
  overflow: 'hidden',
  background: '#dddddd',
  width: '2.25rem',
  height: '2.25rem',
});

export const profileNameBox = style({
  display: 'flex',
  flexDirection: 'column',
});

export const profileImage = style({
  width: '100%',
  height: '100%',

  objectFit: 'cover',
});

export const nicknameText = style({
  fontSize: '1rem',
});

export const statusMessageText = style({
  color: '#4D5061',
  fontSize: '0.75rem',
});
