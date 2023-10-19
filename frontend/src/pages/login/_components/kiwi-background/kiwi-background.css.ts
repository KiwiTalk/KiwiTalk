import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'hidden',

  background: vars.color.surfacePrimary.background,
});

const baseBackground = style({
  background: `repeating-linear-gradient(
    135deg,
    ${vars.color.primary.background},
    ${vars.color.primary.background} 5px,
    transparent 5px,
    transparent 10px
  )`,
});

const circleMask = `linear-gradient(
  172deg,
  rgba(0, 0, 0, 1) 6.18%,
  rgba(0, 0, 0, 0) 93.68%
)`;
export const circle = style([baseBackground, {
  position: 'absolute',
  right: '30%',
  bottom: '40%',

  width: '170px',
  height: '170px',

  clipPath: 'circle(50%)',
  maskImage: circleMask,
  WebkitMaskImage: circleMask,
}]);

const kiwiMask = `linear-gradient(
  125deg,
  rgba(0, 0, 0, 1) 9.42%,
  rgba(0, 0, 0, 0) 87.33%
)`;
export const kiwi = style([baseBackground, {
  position: 'absolute',
  right: '0%',
  bottom: '0%',

  width: '220px',
  height: '193px',

  // eslint-disable-next-line max-len
  clipPath: `path('M99.1672 23.7297C100.121 24.8697 101.708 25.2647 103.085 24.7217C137.993 10.9687 177.61 21.0637 201.721 49.8157C218.652 70.0367 225.454 96.5137 220.383 122.447C215.312 148.379 198.717 170.497 174.832 183.135C144.343 199.293 107.31 195.544 80.5272 173.59C62.7772 159.081 51.4752 138.85 48.6942 116.619C48.1412 112.27 44.9252 108.644 40.6792 107.603C29.2412 104.792 19.2232 98.5307 11.6842 89.4397C11.0512 88.6407 10.4462 87.9627 9.91324 87.3677C8.53124 85.7607 7.51723 84.6347 6.42323 82.6417C4.01623 78.2587 1.46924 71.2527 0.363237 65.8857C-1.46776 56.9977 3.43824 24.9627 19.3112 12.1027C42.3442 -6.57134 76.5622 -3.26633 95.5972 19.4667L99.1672 23.7297Z')`,
  maskImage: kiwiMask,
  WebkitMaskImage: kiwiMask,
}]);
