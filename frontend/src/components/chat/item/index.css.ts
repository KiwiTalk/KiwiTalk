import { style } from '@vanilla-extract/css';

/* base */
const titleFont = style({
  fontSize: 16,
  fontWeight: 600,

  alignSelf: 'flex-end',
});
const messageFont = style({
  fontSize: 12,
  fontWeight: 400,

  alignSelf: 'flex-start',
});

/* default */
export const container = style({
  display: 'grid',
  gridTemplateColumns: '50px 1fr auto',
  gridTemplateRows: 'auto auto',

  width: '100%',
  height: 50,
});

export const imageContainer = style({
  gridColumn: '1 / 2',
  gridRow: '1 / 3',

  display: 'flex',
  padding: 8,
});

export const title = style([titleFont, {
  gridColumn: '2 / 3',
  gridRow: '1 / 2',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 4,
}]);

export const message = style([messageFont, {
  gridColumn: '2 / 3',
  gridRow: '2 / 3',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: 4,
}]);

export const time = style([titleFont, {
  gridColumn: '3 / 4',
  gridRow: '1 / 2',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',

  color: 'gray',
  paddingRight: 8,
}]);

export const state = style([messageFont, {
  gridColumn: '3 / 4',
  gridRow: '2 / 3',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: 4,

  paddingRight: 8,
}]);

export const stateIcon = style({
  width: 16,
  height: 16,

  fill: 'gray',
});

/* optional */
export const unread = style([messageFont, {
  color: 'red',
}]);

export const count = style([titleFont, {
  color: 'gray',
}]);
