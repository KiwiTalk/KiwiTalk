import { style } from '@vanilla-extract/css';

/* base */
const titleFont = style({
  fontSize: 16,
  fontWeight: 600,
});
const messageFont = style({
  fontSize: 12,
  fontWeight: 400,
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
  alignItems: 'flex-end',
  gap: 4,
}]);

export const message = style([messageFont, {
  gridColumn: '2 / 3',
  gridRow: '2 / 3',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: 4,
}]);

export const time = style([titleFont, {
  gridColumn: '3 / 4',
  gridRow: '1 / 2',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',

  color: 'gray',
}]);

export const state = style({
  gridColumn: '3 / 4',
  gridRow: '2 / 3',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'flex-start',
});

/* optional */
export const unread = style([messageFont, {
  color: 'red',
}]);

export const count = style([titleFont, {
  color: 'gray',
}]);
