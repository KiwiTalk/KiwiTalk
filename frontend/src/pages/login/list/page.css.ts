import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

export const container = style({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'stretch',
  gap: '16px',
});

const baseTitle = style([classes.typography.base, {
  fontSize: '40px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',

  color: vars.color.glassPrimary.fillPrimary,
}]);
export const title = styleVariants({
  normal: [baseTitle, {
    fontWeight: 300,
  }],
  bold: [baseTitle, {
    fontWeight: 500,
  }],
});

export const tool = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '0',
});

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
