import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: 'calc(100% + 32px)',
  marginTop: '-32px',

  backgroundColor: vars.color.glassSecondary.background,
});
