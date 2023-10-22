import { styleVariants } from '@vanilla-extract/css';

import { vars } from './vars.css';

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

export const transition = {
  toLeft,
  toUp,

  scale,
};
