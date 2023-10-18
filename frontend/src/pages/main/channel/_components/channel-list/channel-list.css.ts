import { classes, vars } from '@/features/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  height: '100%',

  display: 'flex',
  flexFlow: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
});

export const header = style({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',

  paddingTop: '4px',
  marginBottom: '18px',
});

export const title = style([classes.typography.head1, {
  color: vars.color.secondary.fillPrimary,

  paddingLeft: '12px',
  paddingRight: '12px',
}]);

export const iconContainer = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
});

export const iconButton = style({
  padding: '12px',
  marginLeft: '-4px',

  color: vars.color.secondary.fillPrimary,
});

export const icon = style({
});
