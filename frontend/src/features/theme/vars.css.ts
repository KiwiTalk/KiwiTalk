import { createTheme, style } from '@vanilla-extract/css';

const [themeClass, baseVars] = createTheme({
  color: {
    /* red */
    red400: '#ff4e4e',

    /* blue */
    blue100: '#1c1c22',
    blue200: '#1f2634',
    blue400: '#226cff',
    blue500: '#618ee7',

    /* neutral */
    neutral: {
      black: '#000000',
      white: '#ffffff',

      /* grey */
      grey800: '#e3e3e3',

      /* alpha */
      lightAlpha050: 'rgba(255, 255, 255, .05)',
      lightAlpha100: 'rgba(255, 255, 255, .1)',
      lightAlpha300: 'rgba(255, 255, 255, .3)',
      lightAlpha500: 'rgba(255, 255, 255, .5)',

      darkAlpha200: 'rgba(0, 0, 0, .2)',
    },
  },
  blur: {},
  shadow: {
    regular: '0 4px 24px 0 rgba(0, 0, 0, .25)',
  },
  radius: {
    extraSmall: '6px',
    small: '10px',
    regular: '18px',
    full: '999px',
  },
  opacity: {
    hover: '0.7',
  },
  easing: {
    background: `cubic-bezier(0.55, 0.15, 0.25, 0.95) .4s`,
    fill: `cubic-bezier(0.60, 0.05, 0.60, 1.00) .4s`,
  },
  font: {
    ui: '"Pretendard Variable", sans-serif',
  },
});

type Surface = {
  background: string;
  fillPrimary: string;
  fillSecondary: string;
  fillTertiary?: string;
  elevated?: string;
  attention?: string;
};

const vars = {
  ...baseVars,

  color: {
    ...baseVars.color,
    primary: {
      background: baseVars.color.blue400,
      fillPrimary: baseVars.color.neutral.white,
      fillSecondary: baseVars.color.neutral.lightAlpha500,
      elevated: baseVars.color.neutral.lightAlpha050,
    } satisfies Surface,
    secondary: {
      background: baseVars.color.neutral.black,
      fillPrimary: baseVars.color.neutral.white,
      fillSecondary: baseVars.color.neutral.lightAlpha300,
      attention: baseVars.color.blue500,
      elevated: baseVars.color.neutral.lightAlpha100,
    } satisfies Surface,
    glass: {
      background: baseVars.color.neutral.darkAlpha200,
      fillPrimary: baseVars.color.neutral.white,
      fillSecondary: baseVars.color.neutral.lightAlpha500,
      fillTertiary: baseVars.color.neutral.lightAlpha100,
      attention: baseVars.color.blue400,
    } satisfies Surface,
    overlay: {
      background: baseVars.color.neutral.lightAlpha050,
      fillPrimary: baseVars.color.neutral.white,
      fillSecondary: baseVars.color.neutral.lightAlpha300,
    } satisfies Surface,
  },
};

const themeRoot = style([
  themeClass,
  { fontFamily: vars.font.ui },
]);


export { themeRoot, vars };
