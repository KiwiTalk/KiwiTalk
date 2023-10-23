import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

const baseContainer = style({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',

  backgroundColor: 'transparent',
  borderRadius: vars.radius.regular,
  userSelect: 'none',
  cursor: 'pointer',

  transition: `background ${vars.easing.background}`,

  selectors: {
    '&:hover': {
      backgroundColor: vars.color.overlay.background,
    },
  },
});

export const container = styleVariants({
  default: [baseContainer, {
    width: '100%',

    gap: '12px',
    padding: '12px 16px',
  }],
  collapsed: [baseContainer, {
    width: 44 + 12 + 12,

    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',

    padding: '12px',
  }],
});


const baseTextContainer = style({
  width: '100%',

  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});
export const textContainer = styleVariants({
  default: [baseTextContainer, {
    alignItems: 'flex-start',
    gap: '4px',
  }],
  collapsed: [baseTextContainer, {
    justifyContent: 'center',
    textAlign: 'center',
  }],
});

export const title = styleVariants({
  default: [classes.typography.head3, {
    color: vars.color.overlay.fillPrimary,
  }],
  collapsed: [classes.typography.fineprint, {
    width: '100%',

    fontWeight: 600,
    color: vars.color.overlay.fillPrimary,

    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }],
});

export const description = styleVariants({
  default: [classes.typography.body, {
    color: vars.color.overlay.fillSecondary,
  }],
  collapsed: [classes.typography.fineprint, {
    color: vars.color.overlay.fillSecondary,
  }],
});
