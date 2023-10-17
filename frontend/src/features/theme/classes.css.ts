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

const typographySize16 = style([
  typographyBase,
  {
    fontSize: '16px',
    lineHeight: '18px',
    fontWeight: 600,
  },
]);

const typography = {
  base: typographyBase,

  /** 10 / 14 */
  fineprint: typographySize10,

  /** 12 / 16 */
  body: typographySize12,

  /** 16 / 18 */
  head1: typographySize16,
};

export const classes = {
  typography,
};
