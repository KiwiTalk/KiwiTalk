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

  color: vars.color.glassSecondary.fillPrimary,
}]);
export const title = styleVariants({
  normal: [baseTitle, {
    fontWeight: 300,
  }],
  bold: [baseTitle, {
    fontWeight: 500,
  }],
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'stretch',
  gap: '16px',
});

export const tool = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '0',
});
