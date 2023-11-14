import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
});

export const messageContainer = style({
  display: 'flex',
  flexDirection: 'column',
});

export const profile = style({
  objectFit: 'cover',

  borderRadius: '24px',
  width: '48px',
  height: '48px',

  marginTop: 'auto',

  position: 'sticky',
  bottom: '0px',
});

export const nickname = style([classes.typography.title, {
  color: vars.color.glassSecondary.fillPrimary,
  fontWeight: 700,

  marginLeft: '12px',
  marginBottom: '4px',
}]);
