import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',

  overflow: 'hidden',
});

export const kiwiIcon = style({
  color: 'rgba(0, 0, 0, 0.5)',
  mixBlendMode: 'overlay',

  minWidth: '70%',
  minHeight: '70%',

  maxWidth: '120%',
  maxHeight: '120%',

  position: 'absolute',

  right: '-30%',
  bottom: '-40%',
});
