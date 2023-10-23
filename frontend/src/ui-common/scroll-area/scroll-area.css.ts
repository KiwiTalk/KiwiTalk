import { createVar, style, styleVariants } from '@vanilla-extract/css';

export const fadeValue = createVar();
export const startEdge = createVar();
export const endEdge = createVar();
export const direction = createVar();

const fadeMask = `linear-gradient(${direction},
  rgba(0, 0, 0, ${fadeValue}) 0, rgba(0, 0, 0, 1) ${startEdge},
  rgba(0, 0, 0, 1) calc(100% - ${endEdge}), rgba(0, 0, 0, ${fadeValue}) 100%
) 100% 100% / 100% 100% repeat-x`;

export const container = style({
  vars: {
    [fadeValue]: '0',
    [startEdge]: '16px',
    [endEdge]: '16px',
    [direction]: 'to bottom',
  },

  position: 'relative',

  width: '100%',
  height: '100%',

  overflow: 'auto',

  mask: fadeMask,
  WebkitMask: fadeMask,

  selectors: {
    '&::before': {
      content: '',
      display: 'flex',

      width: startEdge,
      minWidth: startEdge,
      height: startEdge,
      minHeight: startEdge,
    },
    '&::after': {
      content: '',
      display: 'flex',

      width: endEdge,
      minWidth: endEdge,
      height: endEdge,
      minHeight: endEdge,
    },
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
});

export const containerDirectional = styleVariants({
  vertical: {
    width: '100%',
    height: `calc(100% + ${startEdge} + ${endEdge})`,

    marginTop: `calc(-1 * ${startEdge})`,
    marginBottom: `calc(-1 * ${endEdge})`,
  },
  horizontal: {
    width: `calc(100% + ${startEdge} + ${endEdge})`,
    height: '100%',

    marginLeft: `calc(-1 * ${startEdge})`,
    marginRight: `calc(-1 * ${endEdge})`,
  },
});
