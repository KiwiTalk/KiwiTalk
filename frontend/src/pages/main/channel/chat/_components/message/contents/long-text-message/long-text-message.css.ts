import { vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: 'fit-content',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: '12px',
});

const fadeMask = `linear-gradient(180deg,
  rgba(0, 0, 0, 1) 0,
  rgba(0, 0, 0, 1) 95%,
  rgba(0, 0, 0, 0) 100%
) 100% 100% / 100% 100% repeat-x`;
export const content = style({
  display: '-webkit-box',

  whiteSpace: 'pre-line',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  wordBreak: 'break-word',

  color: vars.color.primary.fillPrimary,

  mask: fadeMask,
  WebkitMask: fadeMask,
});

export const button = style({
  width: '100%',

  padding: '12px',
  textAlign: 'center',
  borderTop: `1px solid ${vars.color.primary.elevated}`,
  borderRadius: ` 0px 0px ${vars.radius.small} ${vars.radius.small} !important`,

  selectors: {
    '&::before': {
      borderRadius: ` 0px 0px ${vars.radius.small} ${vars.radius.small} !important`,
    },
    '&::after': {
      borderRadius: ` 0px 0px ${vars.radius.small} ${vars.radius.small} !important`,
    },
  },
});
