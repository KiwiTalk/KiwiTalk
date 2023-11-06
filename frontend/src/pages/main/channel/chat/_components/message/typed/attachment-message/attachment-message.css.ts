import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '16px',

  padding: '6px 0',
});

export const iconWrapper = style({
  padding: '12px',
  fontSize: '36px',

  color: vars.color.primary.fillPrimary,
  backgroundColor: vars.color.primary.elevated,
  borderRadius: vars.radius.small,
});

export const content = style({
  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
});

export const title = style([classes.typography.title, {
  color: vars.color.primary.fillPrimary,
}]);

export const infoContainer = style([classes.typography.body, {
  color: vars.color.primary.fillSecondary,

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '6px',
}]);

export const infoDivider = style({
  width: '1px',
  height: '6px',

  borderRadius: vars.radius.full,
  backgroundColor: vars.color.primary.fillSecondary,
});
