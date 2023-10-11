import { style } from '@vanilla-extract/css';

export const container = style({
  padding: '0.5rem',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0.5rem',
  minWidth: 0,
});

export const profileImageBox = style({
  borderRadius: '50%',
  overflow: 'hidden',
  background: '#dddddd',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  width: '2.25rem',
  height: '2.25rem',
});

export const profileNameBox = style({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  overflow: 'hidden',
});

export const nicknameText = style({
  fontSize: '1rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const statusMessageText = style({
  color: '#4D5061',
  fontSize: '0.75rem',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});
