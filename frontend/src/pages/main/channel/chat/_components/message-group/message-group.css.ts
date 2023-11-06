import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

const baseContainer = style({
  width: '100%',

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'flex-end',
  gap: '8px',
});

export const container = styleVariants({
  other: [baseContainer, {
    flexDirection: 'row',
  }],
  mine: [baseContainer, {
    flexDirection: 'row-reverse',
  }],
});

export const messageContainer = style({
  width: '100%',

  display: 'flex',
  flexDirection: 'column-reverse',
  gap: '0',
});

const baseSender = style([classes.typography.title, {
  color: vars.color.glassSecondary.fillPrimary,
  fontWeight: 700,

  marginLeft: '12px',
  marginBottom: '2px',
  marginTop: '6px',
}]);

export const sender = styleVariants({
  other: [baseSender, {
    alignSelf: 'flex-start',
  }],
  mine: [baseSender, {
    alignSelf: 'flex-end',
  }],
});
