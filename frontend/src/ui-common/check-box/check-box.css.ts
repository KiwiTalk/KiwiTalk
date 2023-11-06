import { style, styleVariants } from '@vanilla-extract/css';

import { vars } from '@/features/theme';

export const container = style({
  width: 'fit-content',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '8px',
});
export const input = style({
  display: 'none',
});

const baseIconWrapper = style({
  width: '24px',
  height: '24px',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: vars.radius.full,
  userSelect: 'none',
  WebkitUserDrag: 'none',

  transition: `box-shadow ${vars.easing.background}, background-color ${vars.easing.background}`,
});
export const iconWrapper = styleVariants({
  unchecked: [baseIconWrapper, {
    boxShadow: `0 0 0 1px ${vars.color.neutral.lightAlpha200} inset`,
    backgroundColor: vars.color.neutral.darkAlpha200,
  }],
  checked: [baseIconWrapper, {
    boxShadow: `0 0 0 12px ${vars.color.primary.background} inset`,
    backgroundColor: vars.color.primary.background,
  }],
});

const strokeLength = 17;
const baseIcon = style({
  width: '18px',
  height: '18px',

  color: vars.color.neutral.white,
  strokeWidth: '2px',
  strokeDasharray: strokeLength,
  cursor: 'pointer',

  transition: `
    opacity ${vars.easing.background},
    stroke-dasharray ${vars.easing.transform},
    stroke-dashoffset ${vars.easing.transform}
  `,
});
export const icon = styleVariants({
  unchecked: [baseIcon, {
    strokeDashoffset: strokeLength,
  }],
  checked: [baseIcon, {
    strokeDashoffset: '0',
  }],
});
