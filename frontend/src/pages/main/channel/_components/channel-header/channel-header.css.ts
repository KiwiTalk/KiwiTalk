import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

export const container = style({
  width: '100%',

  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-end',

  padding: '32px',
  paddingBottom: '20px',

  backgroundColor: vars.color.glassPrimary.background,
  borderBottom: `1px solid ${vars.color.glassPrimary.fillTertiary}`,
});

export const contentContainer = style({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  alignItems: 'center',
  gap: '16px',
});

export const textContainer = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
  gap: '4px',
});

export const text = styleVariants({
  title: [classes.typography.head2, {
    color: vars.color.glassPrimary.fillPrimary,
  }],
  subtitle: [classes.typography.atom.size14, {
    color: vars.color.glassPrimary.fillSecondary,

    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
  }],
});

export const toolContainer = style({
  display: 'flex',
  justifyContent: 'flex-end',
  alignItems: 'center',
  gap: '20px',

  padding: '12px 0',

  color: vars.color.glassPrimary.fillPrimary,
  fontSize: '18px',
});
