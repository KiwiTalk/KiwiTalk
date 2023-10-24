import { globalStyle } from '@vanilla-extract/css';

globalStyle('html, body, #root', {
  width: '100%',
  height: '100%',

  padding: 0,
  margin: 0,

  overflow: 'hidden',
});

globalStyle(`*:where(:not(canvas, iframe, img, svg, svg *, symbol *, video))`, {
  all: 'unset',
  display: 'revert',
});

globalStyle('*, *::before, *::after', {
  boxSizing: 'border-box',
  WebkitFontSmoothing: 'greyscale',
  MozOsxFontSmoothing: 'antialiased',
});

globalStyle('table', {
  borderCollapse: 'collapse',
  borderSpacing: 0,
});

globalStyle('canvas, img, picture, svg, video', {
  display: 'block',
  maxWidth: '100%',
});

globalStyle('a', {
  cursor: 'pointer',
});

globalStyle('button', {
  cursor: 'pointer',
  userSelect: 'none',
});

globalStyle('input::-ms-clear, input::-webkit-search-cancel-button', {
  display: 'none',
});

globalStyle('input::-webkit-inner-spin-button, input::-webkit-outer-spin-button', {
  WebkitAppearance: 'none',
});

