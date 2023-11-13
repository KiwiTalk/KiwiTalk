import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const bubble = style({
  borderRadius: vars.radius.large,

  padding: '12px 18px',
});

export const mine = style({
  backgroundColor: vars.color.primary.background,
  color: vars.color.primary.fillPrimary,

  selectors: {
    '&[data-last="true"]': {
      borderBottomRightRadius: 0,
    },
  },
});

export const others = style({
  backgroundColor: vars.color.solidSecondary.background,
  color: vars.color.solidSecondary.fillPrimary,

  selectors: {
    '&[data-last="true"]': {
      borderBottomLeftRadius: 0,
    },
  },
});
