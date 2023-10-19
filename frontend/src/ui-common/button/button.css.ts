import { classes, vars } from '@/features/theme';
import { ComplexStyleRule, style, styleVariants } from '@vanilla-extract/css';

export const baseButton = style([classes.typography.head3, {
  position: 'relative',

  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: '10px',

  padding: '12px 18px',
}]);

const basePseudoElement: ComplexStyleRule = {
  position: 'absolute',
  content: '',
  inset: 0,
  zIndex: -1,

  borderRadius: vars.radius.full,

  transition: `background-color ${vars.easing.background}`,
};

export const button = styleVariants({
  primary: [baseButton, {
    backgroundColor: vars.color.primary.background,
    color: vars.color.primary.fillPrimary,

    zIndex: 0,
    borderRadius: vars.radius.full,

    selectors: {
      '&::before': basePseudoElement,
      '&::after': basePseudoElement,
      '&:hover::before, &:active::after': {
        backgroundColor: vars.color.primary.elevated,
      },
    },
  }],
  secondary: [baseButton, {
    backgroundColor: vars.color.secondary.background,
    color: vars.color.secondary.fillPrimary,

    zIndex: 0,
    borderRadius: vars.radius.full,

    selectors: {
      '&::before': basePseudoElement,
      '&::after': basePseudoElement,
      '&:hover::before, &:active::after': {
        backgroundColor: vars.color.secondary.elevated,
      },
    },
  }],
  text: [baseButton, {
    backgroundColor: 'transparent',
    color: vars.color.overlay.fillPrimary,

    zIndex: 0,
    borderRadius: vars.radius.full,

    selectors: {
      '&::before': basePseudoElement,
      '&::after': basePseudoElement,
      '&:hover::before, &:active::after': {
        backgroundColor: vars.color.overlay.background,
      },
    },
  }],
  glass: [baseButton, {
    backgroundColor: vars.color.glass.background,
    color: vars.color.glass.fillPrimary,

    zIndex: 0,
    borderRadius: vars.radius.full,
    backdropFilter: vars.blur.regular,

    selectors: {
      '&::before': basePseudoElement,
      '&:hover::before, &:active::before': {
        backgroundColor: vars.color.glass.attention,
      },
    },
  }],
});
