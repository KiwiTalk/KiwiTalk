import { style } from '@vanilla-extract/css';

import { classes, vars } from '@/features/theme';

export const container = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '24px',

  padding: '12px 16px',
  borderRadius: vars.radius.small,

  background: vars.color.glassSecondary.background,
  color: vars.color.glassSecondary.fillSecondary,
  backdropFilter: vars.blur.regular,
  WebkitBackdropFilter: vars.blur.regular,

  transition: `box-shadow ${vars.easing.background}`,

  selectors: {
    '&:focus-within, &:focus': {
      boxShadow: `0 0 0 2px inset ${vars.color.glassSecondary.attention}`,
    },
  },
});

export const input = style([classes.typography.head3, {
  width: '100%',
  minHeight: '24px',

  color: vars.color.glassSecondary.fillPrimary,

  selectors: {
    '&::placeholder': {
      color: vars.color.glassSecondary.fillSecondary,
    },
  },
}]);

export const iconWrapper = style({
  width: '24px',
  height: '24px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  fontSize: '24px',
  color: vars.color.glassSecondary.fillSecondary,

  transition: `color ${vars.easing.background}`,

  selectors: {
    'label:valid > &': {
      color: vars.color.glassSecondary.fillPrimary,
    },
  },
});
