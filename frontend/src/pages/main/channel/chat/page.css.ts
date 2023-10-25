import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',

  width: '100%',
  height: 'calc(100% + 32px)',
  marginTop: '-32px',

  padding: '0 32px',

  backgroundColor: vars.color.glassSecondary.background,
});
