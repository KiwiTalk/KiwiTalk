import { styleVariants } from '@vanilla-extract/css';

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
