import { style, styleVariants } from '@vanilla-extract/css';
import { classes, vars } from '@/features/theme';

export const container = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',

  padding: '32px',
});

export const icon = style({
  width: '100px',
  height: '100px',

  marginBottom: '48px',

  userSelect: 'none',
  WebkitUserDrag: 'none',
});

export const text = styleVariants({
  title: [classes.typography.atom.size24, {
    lineHeight: '28px',
    fontWeight: 700,
    color: vars.color.glassSecondary.fillSecondary,

    marginBottom: '16px',
  }],
  subtitle: [classes.typography.atom.size16, {
    lineHeight: '20px',
    color: vars.color.glassSecondary.fillTertiary,
  }],
});
