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
  },
]);

const typographySize20 = style([
  typographyBase,
  {
    fontSize: '20px',
    lineHeight: '28px',
  },
]);

const typographySize24 = style([
  typographyBase,
  {
    fontSize: '24px',
    lineHeight: '42px',
  },
]);

const typographyNumber = style([typographySize12, {
  fontFeatureSettings: '"cv01" on, "ss06" on',
  fontVariantNumeric: 'lining-nums tabular-nums',
  fontWeight: 500,
  letterSpacing: '-0.04em',
}]);

export const typography = {
  base: typographyBase,

  /** 10 / 14 */
  fineprint: typographySize10,

  /** 12 / 16 */
  body: typographySize12,

  /** 24 / 42 */
  head1: style([typographySize24, { fontWeight: 600 }]),
  /** 20 / 28 */
  head2: style([typographySize20, { fontWeight: 600 }]),
  /** 16 / 18 */
  head3: style([typographySize16, { fontWeight: 600 }]),

  /* special */
  number: typographyNumber,

  /* sized */
  size: {
    size10: typographySize10,
    size12: typographySize12,
    size16: typographySize16,
    size20: typographySize20,
    size24: typographySize24,
  },
};
