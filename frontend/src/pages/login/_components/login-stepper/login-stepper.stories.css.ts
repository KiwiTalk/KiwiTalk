import { style } from '@vanilla-extract/css';

import { vars } from '@/features/theme';

export const background = style({
  background: vars.color.glassSecondary.background,
  borderRadius: '10px',
  height: '300px',

  padding: '16px',
});
