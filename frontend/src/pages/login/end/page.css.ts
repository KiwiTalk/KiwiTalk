import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  gap: '24px',
});

export const title = style([classes.typography.base, {
  textAlign: 'right',
  whiteSpace: 'pre-line',
  lineHeight: 'normal',
  fontSize: '40px',
  fontWeight: 700,
  textTransform: 'uppercase',
  color: vars.color.glassSecondary.fillPrimary,
}]);

export const subtitle = style([classes.typography.head3, {
  fontWeight: 400,
  lineHeight: 'normal',
  marginBottom: '72px',
  color: vars.color.glassSecondary.fillSecondary,
}]);
