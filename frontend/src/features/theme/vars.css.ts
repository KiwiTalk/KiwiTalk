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
      lightAlpha200: 'rgba(255, 255, 255, .2)',
      lightAlpha300: 'rgba(255, 255, 255, .3)',
      lightAlpha500: 'rgba(255, 255, 255, .5)',

      darkAlpha200: 'rgba(0, 0, 0, .2)',
      darkAlpha500: 'rgba(0, 0, 0, .5)',
    },
  },
  blur: {
    regular: 'blur(10px)',
    large: 'blur(20px)',
  },
  shadow: {
    regular: '0 4px 24px 0 rgba(0, 0, 0, .25)',
  },
  radius: {
    extraSmall: '6px',
    small: '10px',
    regular: '18px',
    large: '20px',
    full: '999px',
  },
  layer: {
    /** 가장 아래에 깔리는 layer */
    hidden: '-100',

    /** 기본값 */
    base: '0',
    /** 대상보다 상단 */
    above: '1',
    /** 대상보다 하단 */
    below: '-1',

    /** Surface중 최상단 layer */
    head: '100',
    /** surface 전체를 덮는 Backdrop layer */
    backdrop: '500',
    /** Modal, Dialog가 사용하는 layer*/
    modal: '1000',
    /** 어느 위치에서든 보여야 하는 layer */
    tooltip: '2000',

    /** 최상단 레벨 이 이상의 값은 존재할수 없음 */
    windowFrame: '10000',
  },
  opacity: {
    hover: '0.7',
  },
  easing: {
    background: `cubic-bezier(0.55, 0.15, 0.25, 0.95) .4s`,
    fill: `cubic-bezier(0.60, 0.05, 0.60, 1.00) .4s`,
    transform: `cubic-bezier(0.16, 1, 0.3, 1) .6s`,
    linear: 'linear .4s',
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
    solidPrimary: {
      background: baseVars.color.blue100,
      fillPrimary: baseVars.color.neutral.white,
      fillSecondary: baseVars.color.neutral.lightAlpha300,
    } satisfies Surface,
    solidSecondary: {
      background: baseVars.color.blue200,
      fillPrimary: baseVars.color.neutral.white,
      fillSecondary: baseVars.color.neutral.lightAlpha500,
      attention: baseVars.color.blue400,
    } satisfies Surface,
    glassPrimary: {
      background: baseVars.color.neutral.darkAlpha500,
      fillPrimary: baseVars.color.neutral.white,
      fillSecondary: baseVars.color.neutral.lightAlpha500,
      fillTertiary: baseVars.color.neutral.lightAlpha100,
      attention: baseVars.color.blue400,
    } satisfies Surface,
    glassSecondary: {
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
