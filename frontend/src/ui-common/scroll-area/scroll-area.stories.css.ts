import { vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

const baseBackground = style({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'stretch',

  background: vars.color.solidPrimary.background,
  padding: '12px',
  borderRadius: '10px',
});

export const background = styleVariants({
  vertical: [baseBackground, {
    width: '300px',
    height: '600px',
  }],
  horizontal: [baseBackground, {
    width: '900px',
    height: '300px',
  }],
});

export const container = styleVariants({
  vertical: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  horizontal: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
});

export const item = style({
  color: vars.color.solidPrimary.fillPrimary,

  minWidth: '100px',
  minHeight: '100px',
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
