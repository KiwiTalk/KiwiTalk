import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  width: 'fit-content',
  height: '100%',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  alignItems: 'flex-end',
  gap: '16px',
});

export const placeholder = style([classes.typography.head3, {
  textAlign: 'left',
  color: vars.color.glassSecondary.fillPrimary,

  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '8px',

  alignSelf: 'flex-start',
}]);

export const codeContainer = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '8px',
});

export const codeInput = style({
  width: '18px',
  height: '24px',

  fontSize: '24px',
  textAlign: 'center',
  color: vars.color.glassSecondary.fillPrimary,
});
