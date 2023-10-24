import { classes, vars } from '@/features/theme';
import { createVar, style, styleVariants } from '@vanilla-extract/css';

export const size = createVar();
export const profileContainer = style({
  vars: {
    size: '48px',
  },

  position: 'relative',

  width: size,
  height: size,

  background: vars.color.secondary.background,
  borderRadius: vars.radius.full,

  flexShrink: 0,
});

export const profileImage = style({
  objectFit: 'cover',
  borderRadius: vars.radius.full,
  userSelect: 'none',
  WebkitUserDrag: 'none',
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
    classes.typography.number1,
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
      textAlign: 'center',
      opacity,
      transition: `opacity ${vars.easing.background}`,
    },
  ],
);
