import { vars } from '@/features/theme';
import { createVar, keyframes, style } from '@vanilla-extract/css';

export const size = createVar();
export const container = style({
  height: size,

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '2px 0',
});

const pulse = keyframes({
  '0%': {
    scale: '100%',
  },
  '100%': {
    scale: '50%',
    opacity: 0.5,
  },
});
export const duration = createVar();
export const delayIndex = createVar();
export const dot = style({
  vars: {
    [delayIndex]: '0',
  },

  width: `calc(${size} - 4px)`,
  height: `calc(${size} - 4px)`,
  borderRadius: size,

  animation: vars.easing.linear,
  animationDuration: duration,
  animationName: pulse,
  animationDelay: `calc(${duration} / 3 * ${delayIndex} * 2)`,
  animationFillMode: 'both',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate-reverse',

  backgroundColor: 'currentcolor',
});
