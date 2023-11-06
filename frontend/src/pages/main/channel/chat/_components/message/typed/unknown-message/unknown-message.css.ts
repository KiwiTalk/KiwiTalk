import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style([classes.typography.title, {
  color: vars.color.primary.fillSecondary,

  padding: '16px',
}]);
