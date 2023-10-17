import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

export const profileContainer = style({
  position: 'relative',

  width: '48px',
  height: '48px',

  background: vars.color.secondary.background,
  borderRadius: vars.radius.full,
});

export const profileImage = style({
  objectFit: 'cover',
  borderRadius: vars.radius.full,
});

export const emptyProfileContainer = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '12px',
  fontSize: '24px',

  color: vars.color.secondary.fillPrimary,
});

export const emptyProfileIcon = style({
  width: '24px',
  height: '24px',

  color: vars.color.secondary.fillPrimary,
});

export const profileBadge = styleVariants(
  { active: 1, inactive: 0 },
  (opacity) => [
    classes.typography.body,
    {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      padding: '0 4px',
      minWidth: '16px',
      minHeight: '16px',
      borderRadius: vars.radius.extraSmall,
      background: vars.color.secondary.attention,
      color: vars.color.secondary.fillPrimary,
      fontFeatureSettings: '"cv01" on, "ss06" on',
      fontVariantNumeric: 'lining-nums tabular-nums',
      fontWeight: 500,
      letterSpacing: '-0.04em',
      textAlign: 'center',
      opacity,
      transition: `opacity ${vars.easing.background}`,
    },
  ],
);