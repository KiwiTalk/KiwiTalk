import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

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

export const meFrame = style({
  width: '100%',

  padding: '8px',
  borderRadius: vars.radius.regular,
  border: `1px solid ${vars.color.glassPrimary.fillTertiary}`,
});

export const sectionContainer = styleVariants({
  vertical: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
  },
  horizontal: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'stretch',

    overflowX: 'auto',
  },
  horizontalWrapper: {
    width: 'calc(100% - 16px)',
    margin: '0 8px',

    overflow: 'visible',
  },
});

export const sectionTitleContainer = style({
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '4px',

  padding: '0 12px',
  marginBottom: '4px',

  selectors: {
    '&:not(:first-child)': {
      marginTop: '18px',
    },
  },
});

export const sectionTitle = styleVariants({
  title: [classes.typography.body, {
    color: vars.color.glassPrimary.fillSecondary,
  }],
  number: [classes.typography.number2, {
    color: vars.color.glassPrimary.fillSecondary,
  }],
});
