import { style } from '@vanilla-extract/css';

const typographyBase = style({
  letterSpacing: '-0.01em',
});

const typographySize10 = style([
  typographyBase,
  {
    fontSize: '10px',
    lineHeight: '14px',
  },
]);

const typographySize12 = style([
  typographyBase,
  {
    fontSize: '12px',
    lineHeight: '16px',
  },
]);

const typography = {
  base: typographyBase,

  /** 10 / 14 */
  fineprint: typographySize10,

  /** 12 / 16 */
  body: typographySize12,
};

export const classes = {
  typography,
};
