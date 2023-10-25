import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  position: 'absolute',
  bottom: 0,
  left: 0,

  width: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  gap: '8px',

  padding: '32px',
});

export const input = style([classes.typography.title, {
  width: '100%',

  height: 'auto',
  minHeight: '44px',
  maxHeight: `${18 * 5 + 24}px`,

  padding: '12px 20px',
  scrollPaddingBlock: '12px',

  color: vars.color.solidSecondary.fillPrimary,
  borderRadius: vars.radius.regular,
  background: vars.color.solidSecondary.background,

  overflowY: 'hidden',
  wordWrap: 'break-word',

  selectors: {
    '&::placeholder': {
      color: vars.color.solidSecondary.fillSecondary,
    },
  },
}]);

export const button = style({
  padding: '12px',
  fontSize: '20px',

  color: vars.color.solidSecondary.attention,
  background: vars.color.solidSecondary.background,
  borderRadius: vars.radius.regular,
});
