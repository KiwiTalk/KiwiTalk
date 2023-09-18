import { style } from '@vanilla-extract/css';

export const contentContainer = style({
  width: '100%',
  height: '100%',
});

export const background = style({
  position: 'absolute',

  left: '0%',
  top: '0%',

  width: '100%',
  height: '100%',
});

export const backgroundPattern = style({
  position: 'absolute',

  width: '64%',
  height: '64%',

  left: '0%',
  top: '0%',
});

export const container = style({
  background: 'linear-gradient(107.56deg, #FFFFFF 0%, #FFFAE0 100%)',

  position: 'relative',
});
