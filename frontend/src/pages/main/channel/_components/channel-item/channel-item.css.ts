import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

const baseChannelItemContainer = style({
  width: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '16px',

  padding: '16px',
  marginBottom: '-6px',

  borderRadius: vars.radius.regular,
  cursor: 'pointer',
  outlineStyle: 'solid',
  outlineColor: 'transparent',

  transition: `background ${vars.easing.background}, outline ${vars.easing.background}`,
});

export const channelItemContainer = styleVariants({
  active: [baseChannelItemContainer, {
    background: vars.color.primary.elevated,
    outlineWidth: '2px',

    selectors: {
      '&:hover': {
        outlineColor: vars.color.secondary.elevated,
      },
    },
  }],
  inactive: [baseChannelItemContainer, {
    outlineOffset: '-8px',
    outlineWidth: '2px',

    selectors: {
      '&:hover': {
        outlineColor: vars.color.secondary.elevated,
      },
    },
  }],
});

export const contentContainer = style({
  minWidth: '0px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'flex-start',
  gap: '8px',

  overflow: 'hidden',
});

export const header = style([classes.typography.body, {
  width: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '5px',

  color: vars.color.primary.fillSecondary,
}]);

export const title = style([classes.typography.head3, {
  color: vars.color.primary.fillPrimary,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',

  flexShrink: 1,
}]);

export const icon = style({
  flexShrink: 0,
});

export const content = style([classes.typography.body, {
  display: '-webkit-box',

  color: vars.color.primary.fillPrimary,

  whiteSpace: 'pre-line',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineClamp: 2,
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
}]);

export const time = style([classes.typography.fineprint, {
  marginLeft: 'auto',

  flexShrink: 0,
}]);
