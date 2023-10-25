import { vars } from '@/features/theme';
import { createVar, style } from '@vanilla-extract/css';

export const background = style({
  width: '300px',
  height: '600px',

  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',

  background: vars.color.solidPrimary.background,
  padding: '16px',
  borderRadius: '10px',
});

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
});

export const height = createVar();
export const item = style({
  vars: {
    [height]: '50px',
  },

  color: vars.color.solidPrimary.fillPrimary,

  width: '100%',
  height: height,
  padding: '16px',

  selectors: {
    '&:nth-child(3n + 1)': {
      background: 'rgba(255, 0, 0, 0.5)',
    },
    '&:nth-child(3n + 2)': {
      background: 'rgba(0, 255, 0, 0.5)',
    },
    '&:nth-child(3n)': {
      background: 'rgba(0, 0, 255, 0.5)',
    },
  },
});
