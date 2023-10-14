import { style, styleVariants } from '@vanilla-extract/css';
import { vars, classes } from '@/features/theme';

export const container = style({
  'display': 'flex',
  'minHeight': '32px',
  'padding': '0 32px',
  'alignItems': 'center',
  '::before': {
    content: '',
    flex: '1 1 0',
  },
});

export const title = style([
  classes.typography.fineprint,
  {
    color: 'rgba(255, 255, 255, .3)',
    flex: '1 1 0',
    fontWeight: 500,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    padding: '0 32px',
  },
]);

export const buttons = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  flex: '1 1 0',
  gap: '24px',
});

export const buttonBase = style({
  width: '12px',
  height: '12px',
  borderRadius: '100%',
  transition: `all ${vars.easing.background}`,
});

export const buttonMinMax = styleVariants({
  active: [buttonBase, {
    'background': vars.color.neutral.grey.grey800,
    ':hover': { opacity: vars.opacity.hover },
  }],
  inactive: [buttonBase, { background: vars.color.secondary.fillSecondary }],
});

export const buttonClose = styleVariants({
  active: [buttonBase, {
    'background': vars.color.red.red400,
    ':hover': { opacity: vars.opacity.hover },
  }],
  inactive: [buttonBase, { background: vars.color.secondary.fillSecondary }],
});

