import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',
  width: '100%',
  height: 'calc(100% + 32px)',
  marginTop: '-32px',
});

export const contentContainer = style({
  position: 'absolute',
  inset: '0',

  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',

  padding: '72px 96px',
});

export const infoContainer = style({
  height: '100%',

  flex: 1,

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '18px',

  color: vars.color.surfacePrimary.fillPrimary,
});

export const iconWrapper = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '16px',
  fontSize: '36px',
  borderRadius: vars.radius.small,
  marginBottom: '12px',

  background: vars.color.surfaceSecondary.background,
  color: vars.color.surfaceSecondary.attention,
});

export const infoTitle = styleVariants({
  main: [classes.typography.head1, {
    lineHeight: 'normal',
    color: vars.color.surfacePrimary.fillPrimary,
  }],
  other: [classes.typography.head1, {
    lineHeight: 'normal',
    color: vars.color.surfacePrimary.fillSecondary,
  }],
});
