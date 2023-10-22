import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',

  background: vars.color.glassPrimary.background,
});

const baseBackground = style({
  background: `repeating-linear-gradient(
    135deg,
    ${vars.color.primary.background},
    ${vars.color.primary.background} 5px,
    transparent 5px,
    transparent 10px
  )`,

  transform: 'translate(var(--offset-x, 0), var(--offset-y, 0))',
  transition: `transform ${vars.easing.transform}`,
  transitionDuration: '3s',
});

const circleMask = `linear-gradient(
  172deg,
  rgba(0, 0, 0, 1) 6.18%,
  rgba(0, 0, 0, 0) 93.68%
)`;
export const circle = style([baseBackground, {
  position: 'absolute',
  right: '35%',
  bottom: '30%',

  width: '170px',
  height: '170px',

  clipPath: 'circle(50%)',
  maskImage: circleMask,
  WebkitMaskImage: circleMask,
}]);

const kiwiMask = `linear-gradient(
  125deg,
  rgba(0, 0, 0, 1) 9.42%,
  rgba(0, 0, 0, 0) 87.33%
)`;
export const kiwi = style([baseBackground, {
  position: 'absolute',
  right: '-5%',
  bottom: '-10%',

  width: '348px',
  height: '326px',

  // eslint-disable-next-line max-len
  clipPath: `path('M211.931 66.8476L212.648 71.0413L216.902 71.0047C217.268 71.0016 217.634 71 218 71C287.036 71 343 126.964 343 196C343 265.036 287.036 321 218 321C148.964 321 93 265.036 93 196C93 179.516 96.1881 163.789 101.977 149.393L103.561 145.454L99.9301 143.252C83.1416 133.072 70.7018 116.453 66.0276 96.8408L65.2219 93.4602L61.7724 93.0372L24.9941 88.5274L60.6026 78.3059L63.95 77.345L64.2092 73.8721C67.083 35.3583 99.2485 5 138.5 5C175.329 5 205.926 31.7294 211.931 66.8476Z')`,
  maskImage: kiwiMask,
  WebkitMaskImage: kiwiMask,
}]);
