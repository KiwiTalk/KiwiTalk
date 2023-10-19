import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  minWidth: '400px',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '16px',

  padding: '24px 20px',
  borderRadius: vars.radius.regular,

  backdropFilter: vars.blur.regular,
  WebkitBackdropFilter: vars.blur.regular,
  backgroundColor: vars.color.glassPrimary.background,
});

export const textContainer = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '4px',
});

export const name = style([classes.typography.head1, {
  color: vars.color.glassPrimary.fillPrimary,
  lineHeight: 'normal',

  gridColumn: '2 / span 1',
  gridRow: '1 / span 1',
}]);

export const email = style([classes.typography.body, {
  color: vars.color.glassPrimary.fillSecondary,

  gridColumn: '2 / span 1',
  gridRow: '2 / span 1',
}]);
