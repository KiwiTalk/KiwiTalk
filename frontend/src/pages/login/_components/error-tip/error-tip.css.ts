import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const error = style([classes.typography.body, {
  color: vars.color.red400,

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '8px',

  alignSelf: 'flex-start',
}]);

export const errorIcon = style([classes.typography.body, {
  width: '16px',
  height: '16px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: vars.radius.full,
  color: vars.color.neutral.white,
  backgroundColor: vars.color.red400,
}]);
