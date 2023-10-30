import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const image = style({
  minWidth: '40px',
  minHeight: '40px',

  maxWidth: '100%',
  maxHeight: '100%',

  borderRadius: vars.radius.small,
  overflow: 'hidden',
});
