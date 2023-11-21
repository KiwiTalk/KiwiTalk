import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',

  margin: '2px 4px',
});

export const left = style({
  alignItems: 'flex-start',
});

export const right = style({
  alignItems: 'flex-end',
});

export const unread = style([classes.typography.number1, {
  color: vars.color.glassSecondary.attention,
  whiteSpace: 'pre',
}]);

export const time = style([classes.typography.number1, {
  color: vars.color.glassSecondary.fillSecondary,
}]);
