import { vars } from '@/features/theme';
import { createVar, keyframes, style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '2px',
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
export const size = createVar();
export const duration = createVar();
export const delayIndex = createVar();
export const dot = style({
  vars: {
    [delayIndex]: '0',
  },

  width: size,
  height: size,
  borderRadius: size,

  animation: vars.easing.linear,
  animationDuration: duration,
  animationName: pulse,
  animationDelay: `calc(${duration} / 3 * ${delayIndex} * 2)`,
  animationFillMode: 'both',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate-reverse',

  backgroundColor: vars.color.glassSecondary.background,
  backdropFilter: vars.blur.regular,
});
