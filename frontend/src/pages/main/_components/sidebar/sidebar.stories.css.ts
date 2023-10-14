import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const background = style({
  background: vars.color.blue.blue100,
  borderRadius: '18px',
  height: '500px',
  padding: '24px 10px',
});
