import { style } from '@vanilla-extract/css';

export const checkBoxInput = style({
  display: 'none',
});

export const iconContainer = style({
  display: 'inline-block',
  width: '1.125rem',
  height: '1.125rem',

  margin: 'auto 6px auto 0px',
  lineHeight: 0,
});

export const checkBoxContainer = style({
  display: 'inline-block',

  color: '#1E2019',

  selectors: {
    '[data-disabled=true]': {
      color: '#BFBDC1',
    },
  },
});

export const checkBoxLabel = style({
  display: 'flex',

  transition: 'all 0.25s',

  lineHeight: 1,
  padding: '3px 3px',
});
