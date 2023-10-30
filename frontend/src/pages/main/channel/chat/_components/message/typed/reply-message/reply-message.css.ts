import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: 'fit-content',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  gap: '10px',
});

export const replyContainer = style({
  position: 'relative',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '4px',

  paddingLeft: '20px',
  margin: '0 -8px',
  borderRadius: vars.radius.small,
  cursor: 'pointer',

  transition: `background-color ${vars.easing.background}`,

  selectors: {
    '&:hover': {
      backgroundColor: vars.color.primary.elevated,
    },
    '&:active': {
      backgroundColor: vars.color.primary.elevated,
    },
  },
});
export const replyText = styleVariants({
  sender: [classes.typography.body, {
    fontWeight: 700,
    color: vars.color.primary.fillSecondary,
  }],
  content: [classes.typography.body, {
    color: vars.color.primary.fillSecondary,
  }],
});

export const replyDivider = style({
  position: 'absolute',
  top: '6px',
  bottom: '6px',
  left: '8px',

  width: '2px',

  backgroundColor: vars.color.primary.fillSecondary,
  borderRadius: vars.radius.full,
});
