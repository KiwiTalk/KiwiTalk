import { classes, vars } from '@/features/theme';
import { style, styleVariants } from '@vanilla-extract/css';

const sidebarBase = style({
  width: '60px',
  padding: '8px',

  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const sidebar = styleVariants({
  default: [
    sidebarBase,
    {
      background: vars.color.secondary.background,
      borderRadius: vars.radius.regular,
      boxShadow: vars.shadow.regular,
      height: '100%',
    },
  ],
  collapsed: [sidebarBase],
});

export const sidebarItems = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const sidebarItem = styleVariants(
  {
    active: [vars.color.secondary.elevated, vars.color.secondary.fillPrimary],
    inactive: ['transparent', vars.color.secondary.fillSecondary],
  },
  ([background, color]) => ({
    cursor: 'pointer',
    position: 'relative',
    color,
    background,
    borderRadius: vars.radius.small,
    padding: '10px',
    fontSize: '24px',
    transition: `color ${vars.easing.fill}, background-color ${vars.easing.background}`,
  }),
);

export const sidebarButtonBadge = styleVariants(
  { active: 1, inactive: 0 },
  (opacity) => [
    classes.typography.body,
    {
      position: 'absolute',
      top: '-2px',
      right: '-2px',
      padding: '0 4px',
      minWidth: '16px',
      minHeight: '16px',
      borderRadius: vars.radius.extraSmall,
      background: vars.color.secondary.attention,
      color: vars.color.secondary.fillPrimary,
      fontFeatureSettings: '"cv01" on, "ss06" on',
      fontVariantNumeric: 'lining-nums tabular-nums',
      fontWeight: 500,
      letterSpacing: '-0.04em',
      textAlign: 'center',
      opacity,
      transition: `opacity ${vars.easing.background}`,
    },
  ],
);

const sidebarToggleBase = style({
  '::after': {
    content: '',
    display: 'inline-block',
    position: 'absolute',
    left: '50%',
    bottom: '0',
    width: '10px',
    height: '2px',
    borderRadius: vars.radius.full,
    background: vars.color.secondary.attention,
    transform: 'translate(-50%)',
    opacity: '0',
    transition: `opacity ${vars.easing.fill}`,
  },
});

export const sidebarToggle = styleVariants({
  active: [
    sidebarToggleBase,
    sidebarItem.active,
    { '::after': { opacity: 1 } },
  ],
  inactive: [
    sidebarToggleBase,
    sidebarItem.inactive,
  ],
});

export const sidebarToggleInput = style({
  appearance: 'none',
  position: 'absolute',
  inset: '0',
});

export const sidebarToggleIconContainer = style({
  position: 'relative',
  display: 'inline-flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '1em',
  height: '1em',
});

export const sidebarToggleIcon = styleVariants(
  { active: 1, inactive: 0 },
  (opacity) => ({
    position: 'absolute',
    inset: '0',
    opacity,
    transition: `opacity ${vars.easing.fill}`,
  }),
);
