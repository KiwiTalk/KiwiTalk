import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

const bubble = style({
  borderRadius: vars.radius.large,

  padding: '12px 18px',
});

export const clientBubble = style([bubble, {
  backgroundColor: vars.color.primary.background,
  color: vars.color.primary.fillPrimary,
}]);

export const clientLast = style({
  borderBottomRightRadius: 0,
});

export const userBubble = style([bubble, {
  backgroundColor: vars.color.solidSecondary.background,
  color: vars.color.solidSecondary.fillPrimary,
}]);

export const userLast = style({
  borderBottomLeftRadius: 0,
});
