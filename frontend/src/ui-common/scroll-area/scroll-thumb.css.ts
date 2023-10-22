import { vars } from '@/features/theme';
import { createVar, style, styleVariants } from '@vanilla-extract/css';

export const thumbSize = createVar();
export const thumbPosition = createVar();
const baseScrollThumb = style({
  position: 'absolute',

  minWidth: '8px',
  minHeight: '8px',

  background: vars.color.glassPrimary.background,
  backgroundClip: 'padding-box',

  border: '2px solid transparent',
  borderRadius: vars.radius.full,
  cursor: 'pointer',

  transition: `
    opacity ${vars.easing.background},
    min-width ${vars.easing.transform},
    min-height ${vars.easing.transform}
  `,
});

export const scrollThumb = styleVariants({
  normal: [baseScrollThumb],
  expand: [baseScrollThumb, {
    minWidth: '12px',
    minHeight: '12px',
  }],
});

export const scrollThumbDirectional = styleVariants({
  vertical: {
    top: '0',
    right: '0',

    height: thumbSize,
    transform: `translateY(${thumbPosition})`,
  },
  horizontal: {
    bottom: '0',
    left: '0',

    width: thumbSize,
    transform: `translateX(${thumbPosition})`,
  },
});

export const hide = style({
  opacity: '0',
});
