import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const background = style({
  background: vars.color.blue100,
  borderRadius: '10px',
  height: '300px',
});
