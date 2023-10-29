import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

export const virtualList = styleVariants({
  outer: {
    position: 'relative',

    width: '100%',
    height: '100%',
    overflow: 'auto',
    overflowX: 'hidden',

    selectors: {
      '&::-webkit-scrollbar': {
        display: 'none',
      },
      '&::-webkit-scrollbar-track': {
        display: 'none',
      },
      '&::-webkit-scrollbar-thumb': {
        display: 'none',
      },
    },
  },
  inner: {
    position: 'absolute',
    top: 0,
    left: 0,

    width: '100%',
  },
});

export const loader = style([classes.typography.title, {
  width: 'fit-content',
  height: 'fit-content',

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  padding: '16px 24px',
  margin: 'auto',

  backgroundColor: vars.color.glassSecondary.background,
  color: vars.color.glassSecondary.fillSecondary,
  borderRadius: vars.radius.regular,
}]);
