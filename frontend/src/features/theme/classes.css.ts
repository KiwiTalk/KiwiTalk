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

const typographySize20 = style([
  typographyBase,
  {
    fontSize: '20px',
    lineHeight: '28px',
    fontWeight: 600,
  },
]);

const typographySize24 = style([
  typographyBase,
  {
    fontSize: '24px',
    lineHeight: '42px',
    fontWeight: 600,
  },
]);

const typographyNumber = style([typographySize12, {
  fontFeatureSettings: '"cv01" on, "ss06" on',
  fontVariantNumeric: 'lining-nums tabular-nums',
  fontWeight: 500,
  letterSpacing: '-0.04em',
}]);

const typography = {
  base: typographyBase,

  /** 10 / 14 */
  fineprint: typographySize10,

  /** 12 / 16 */
  body: typographySize12,

  /** 24 / 42 */
  head1: typographySize24,
  /** 20 / 28 */
  head2: typographySize20,
  /** 16 / 18 */
  head3: typographySize16,

  /* special */
  number: typographyNumber,
};

export const classes = {
  typography,
};
