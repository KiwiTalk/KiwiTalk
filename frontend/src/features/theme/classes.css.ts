import { style, styleVariants } from '@vanilla-extract/css';

import { vars } from './vars.css';

const typographyBase = style({
  letterSpacing: '-0.01em',
});

const typographySize10 = style([
  typographyBase,
  {
    fontSize: '10px',
    lineHeight: '14px',
  },
]);

const typographySize12 = style([
  typographyBase,
  {
    fontSize: '12px',
    lineHeight: '16px',
  },
]);

const typographySize16 = style([
  typographyBase,
  {
    fontSize: '16px',
    lineHeight: '18px',
    fontWeight: 600,
  },
]);

const typographySize20 = style([
  typographyBase,
  {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: 600,
  },
]);

const typographySize24 = style([
  typographyBase,
  {
    fontSize: '24px',
    lineHeight: '42px',
    fontWeight: 600,
  },
]);

const typographyNumber = style([typographySize12, {
  fontFeatureSettings: '"cv01" on, "ss06" on',
  fontVariantNumeric: 'lining-nums tabular-nums',
  fontWeight: 500,
  letterSpacing: '-0.04em',
}]);

const typography = {
  base: typographyBase,

  /** 10 / 14 */
  fineprint: typographySize10,

  /** 12 / 16 */
  body: typographySize12,

  /** 24 / 42 */
  head1: typographySize24,
  /** 20 / 28 */
  head2: typographySize20,
  /** 16 / 18 */
  head3: typographySize16,

  /* special */
  number: typographyNumber,
};

/* transition */
const scale = styleVariants({
  enterClass: {
    opacity: 0,
    transform: 'scale(0.9)',
  },
  exitToClass: {
    opacity: 0,
    transform: 'scale(0.9)',
  },
  enterActiveClass: {
    position: 'absolute',
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
  moveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
  exitActiveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
});

const toLeft = styleVariants({
  enterClass: {
    transform: 'translateX(32px)',
    opacity: 0,
  },
  exitToClass: {
    transform: 'translateX(-32px)',
    opacity: 0,
  },
  enterActiveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
  moveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
  exitActiveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
});
const toUp = styleVariants({
  enterClass: {
    transform: 'translateY(32px)',
    opacity: 0,
  },
  exitToClass: {
    transform: 'translateY(-32px)',
    opacity: 0,
  },
  enterActiveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
  moveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
  exitActiveClass: {
    transition: `
      opacity ${vars.easing.background},
      transform ${vars.easing.transform}
    `,
  },
});

const transition = {
  toLeft,
  toUp,

  scale,
};

export const classes = {
  typography,
  transition,
};
