import { vars } from '@/features/theme';
import { createVar, style, styleVariants } from '@vanilla-extract/css';

export const thumbSize = createVar();
export const thumbPosition = createVar();
export const scrollThumb = style({
  position: 'absolute',

  minWidth: '8px',
  minHeight: '8px',

  background: vars.color.glassPrimary.background,
  backdropFilter: vars.blur.regular,

  borderRadius: vars.radius.full,
  boxShadow: vars.shadow.regular,
});

export const scrollThumbDirectional = styleVariants({
  vertical: {
    top: '0',
    right: '0',

    margin: '0 4px',
    height: thumbSize,
    transform: `translateY(${thumbPosition})`,
  },
  horizontal: {
    bottom: '0',
    left: '0',

    margin: '4px 0',
    width: thumbSize,
    transform: `translateX(${thumbPosition})`,
  },
});
