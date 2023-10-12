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

const text = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const nicknameText = style([text, {
  fontSize: '1rem',
}]);

export const statusMessageText = style([text, {
  color: '#4D5061',
  fontSize: '0.75rem',
}]);
