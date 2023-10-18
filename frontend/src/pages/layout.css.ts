import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',

  backgroundColor: vars.color.neutral.darkAlpha500,
});
