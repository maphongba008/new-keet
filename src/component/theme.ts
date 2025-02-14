import { useMemo } from 'react'
import { type TextStyle } from 'react-native'
import { type LinearGradientProps } from 'react-native-linear-gradient'
import {
  FadeIn,
  FadeInRight,
  FadeOut,
  FadeOutLeft,
  Layout,
} from 'react-native-reanimated'
import { create } from 'zustand'

import { UI_SIZE_8, UI_SIZE_16, UI_SIZE_32 } from 'lib/commonStyles'
import { isIOS } from 'lib/platform'

export const typography = {
  regular: {
    includeFontPadding: false,
    fontFamily: 'OpenSans-Regular',
  },
  bold: {
    includeFontPadding: false,
    fontFamily: 'OpenSans-Bold',
  },
  semiBold: {
    includeFontPadding: false,
    fontFamily: 'OpenSans-SemiBold',
  },
  italic: {
    includeFontPadding: false,
    fontFamily: 'OpenSans-Italic',
  },
  boldItalic: {
    includeFontPadding: false,
    fontFamily: 'OpenSans-BoldItalic',
  },
  mono: {
    fontFamily: isIOS ? 'Courier' : 'monospace',
  },
}

/**
 * color
 */

// NOTICE: color3 is lighter than color2

export const colors = {
  black: '#000000',
  peer_green: '#95E6CB',
  peer_green_dark: '#1D6E53',
  north_sea_blue: '#141925',
  north_sea_blue2: '#181D28',
  north_sea_blue3: '#1A2531',
  keet_grey_900: '#0D0F16',
  keet_grey_800: '#151823',
  keet_grey_700: '#1A1D29',
  keet_grey_600: '#222430',
  keet_grey_500: '#3E404B',
  keet_grey_400: '#565864',
  keet_grey_300: '#707785',
  keet_grey_200: '#A0A8B8',
  keet_grey_100: '#CED3DC',
  keet_grey_000: '#F7F8FA',
  keet_primary_blue20: '#26D2E833',
  keet_primary_blue_darker: '#005066',
  keet_blue_1: '#015F79',
  keet_almostBlack: '#151517',
  keet_old_lightRed: '#E69595',
  keet_lightRed20: '#FF6D6D33',
  keet_secondary_red20: '#CE3B3B33',
  keet_secondary_red8: '#CE3B3B14',
  keet_secondary_purple20: '#5241BC33',
  keet_purple_1: '#7867E3',
  keet_purple_2: '#202143',
  keet_secondary_yellow20: '#F2B41433',
  keet_notice_yellow: '#EED000',
  keet_midnight_blue: '#0F2932',
  highway_gray: '#252B39',
  highway_gray2: '#323A4C',
  highway_gray3: '#8F9298',
  white_snow: '#ffffff',
  error: '#ED695F',
  warning: '#FFA597',
  flag: '#FFCC66',
  text_grey: '#ACB1BB',
  midnight_green: '#054452',
  el_salvador: '#FFBF00',
  dark_yellow: '#403822',
  tooltip_arrow_color: '#181B23',
  fuschia_500: '#F47AFA',
  fuschia_900: '#851E8A',
  fuschia_950: '#2B162C',
  indigo_400: '#9887FF',
  indigo_700: '#5241BC',
  indigo_950: '#28253E',
  blue_200: '#6EE1F0',
  blue_400: '#26D2E8',
  blue_600: '#067FA0',
  blue_900: '#005066',
  blue_950: '#183E4C',
  green_300: '#53EA98',
  green_400: '#49C080',
  green_500: '#40A970',
  green_950: '#253531',
  yellow_500: '#F2B414',
  yellow_800: '#876101',
  yellow_950: '#483C1C',
  red_300: '#FFA6A6',
  red_400: '#FF6D6D',
  red_600: '#CE3B3B',
  red_800: '#6F3030',
  red_900: '#392029',
  red_950: '#231C27',
  modal_backdrop: 'rgba(0, 0, 0, 0.1)',
  transparent: 'transparent',
}

export const gradient: { [key: string]: LinearGradientProps } = {
  keet_gradient_brightBlue: {
    colors: ['#00FFCF', '#4AA6FF'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  keet_gradient_brightBlue20: {
    colors: ['#00FFCF33', '#4AA6FF33'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  keet_gradient_brightBlue8: {
    colors: ['#00FFCF14', '#4AA6FF14'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  keet_gradient_pink: {
    colors: ['#A55282', '#F27C34'],
    useAngle: true,
    angle: 63.76,
    angleCenter: { x: 0.5, y: 0.5 },
  },

  keet_gradient_pink20: {
    colors: ['#A5528233', '#F27C3433'],
    useAngle: true,
    angle: 63.76,
    angleCenter: { x: 0.5, y: 0.5 },
  },

  keet_gradient_pink8: {
    colors: ['#A5528214', '#F27C3414'],
    useAngle: true,
    angle: 63.76,
    angleCenter: { x: 0.5, y: 0.5 },
  },

  keet_gradient_grey: {
    colors: ['rgba(34, 36, 48, 0.95)', 'rgba(34, 36, 48, 0.95)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },

  keet_gradient_blue_to_orange: {
    colors: ['#00FFCF', '#4AA6FF', '#A55282', '#F27C34'],
    useAngle: true,
    angle: 67,
    angleCenter: { x: 0.5, y: 0.5 },
  },

  keet_tooltip_gray: {
    colors: ['#1F2430', '#181B23'],
    useAngle: true,
    angle: 63.76,
    angleCenter: { x: 0.5, y: 0.5 },
  },
}

export const colorWithAlpha = (color: string, percent: number): string => {
  let alpha = Math.floor(percent * 255).toString(16)
  if (alpha === '0') {
    alpha = '00'
  }
  return `${color}${alpha}`
}

/**
 * themes
 */

export interface Theme {
  color: {
    bg: string
    bg2: string
    bg3: string
    bg4: string
    bg5: string
    grey_900: string
    grey_800: string
    grey_700: string
    grey_600: string
    grey_500: string
    grey_400: string
    grey_300: string
    grey_200: string
    grey_100: string
    grey_000: string
    almost_black: string
    primary_blue_20: string
    accent: string
    accentDark: string
    danger: string
    attention: string
    flag: string
    el_salvador: string
    midnight_blue: string
    dark_yellow: string
    blue_200: string
    blue_400: string
    blue_600: string
    blue_900: string
    blue_950: string
    red_300: string
    red_400: string
    red_600: string
    red_800: string
    red_900: string
    red_950: string
    yellow_500: string
    yellow_800: string
    yellow_950: string
    green_300: string
    green_400: string
    green_500: string
    green_950: string
    indigo_400: string
    indigo_700: string
    indigo_950: string
    fuschia_500: string
    fuschia_900: string
    fuschia_950: string
  }
  text: {
    code: TextStyle
    btmTab: TextStyle
    title: TextStyle
    title2: TextStyle
    body: TextStyle
    placeholder: TextStyle
    bodyBold: TextStyle
    bodySemiBold: TextStyle
    bodyItalic: TextStyle
    bodyBoldItalic: TextStyle
    tag: TextStyle
    reply: TextStyle
    replyBold: TextStyle
    flag: TextStyle
    inlineCode: TextStyle
    codeBlock: TextStyle
    greyText: TextStyle
    subtitle: TextStyle
  }
  border: {
    width: number
    color: string
    colorFocus: string
    radiusSmall: number
    radiusNormal: number
    radiusLarge: number
  }
  icon: {
    size: number
    closeColor: string
  }
  spacing: {
    normal: number
    standard: number
    large: number
  }
  animation: {
    ms: number
  }
  modal: {
    bg: string
    borderColor: string
  }
  background: {
    bg_1: string
    bg_2: string
  }
  button: {
    height: number
    textColor: string
    successColor: string
    warnColor: string
    dangerColor: string
    borderColor: string
  }
  bars: {
    navigationBarHeight: number
    bottomTabBarHeight: number
  }
  progress: {
    mainColor: string
    darkerColor: string
  }
  reactions: {
    active: string
    mine: string
    other: string
  }
  memberTypes: {
    admin: string
    mod: string
    mine: string
    blocked: string
  }
}

export const hexToRgb = (hex: string) =>
  // @ts-ignore
  hex
    .replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
    )
    .substring(1)
    .match(/.{2}/g)
    .map((x) => parseInt(x, 16))

export const hexToRgbOpacity = (hex: string, opacity: number) => {
  const rgbColor = hexToRgb(hex)
  return `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, ${opacity})`
}

export const mainTheme: Theme = {
  color: {
    bg: colors.north_sea_blue,
    bg2: colors.north_sea_blue2,
    bg3: colors.highway_gray,
    bg4: colors.highway_gray2,
    bg5: colors.north_sea_blue3,
    grey_900: colors.keet_grey_900,
    grey_800: colors.keet_grey_800,
    grey_700: colors.keet_grey_700,
    grey_600: colors.keet_grey_600,
    grey_500: colors.keet_grey_500,
    grey_400: colors.keet_grey_400,
    grey_300: colors.keet_grey_300,
    grey_200: colors.keet_grey_200,
    grey_100: colors.keet_grey_100,
    grey_000: colors.keet_grey_000,
    almost_black: colors.keet_almostBlack,
    primary_blue_20: colors.keet_primary_blue20,
    accent: colors.peer_green,
    accentDark: colors.peer_green_dark,
    danger: colors.error,
    attention: colors.warning,
    flag: colors.flag,
    el_salvador: colors.el_salvador,
    midnight_blue: colors.keet_midnight_blue,
    dark_yellow: colors.dark_yellow,
    blue_200: colors.blue_200,
    blue_400: colors.blue_400,
    blue_600: colors.blue_600,
    blue_900: colors.blue_900,
    blue_950: colors.blue_950,
    red_300: colors.red_300,
    red_400: colors.red_400,
    red_600: colors.red_600,
    red_800: colors.red_800,
    red_900: colors.red_900,
    red_950: colors.red_950,
    yellow_500: colors.yellow_500,
    yellow_800: colors.yellow_800,
    yellow_950: colors.yellow_950,
    green_300: colors.green_300,
    green_400: colors.green_400,
    green_500: colors.green_500,
    green_950: colors.green_950,
    indigo_400: colors.indigo_400,
    indigo_700: colors.indigo_700,
    indigo_950: colors.indigo_950,
    fuschia_500: colors.fuschia_500,
    fuschia_900: colors.fuschia_900,
    fuschia_950: colors.fuschia_950,
  },
  text: {
    btmTab: {
      ...typography.regular,
      color: colors.white_snow,
      fontSize: 10,
    },
    title: {
      ...typography.bold,
      color: colors.white_snow,
      fontSize: 18,
    },
    title2: {
      ...typography.bold,
      color: colors.white_snow,
      fontSize: 16,
    },
    body: {
      ...typography.regular,
      color: colors.white_snow,
      fontSize: 16,
    },
    bodyBold: {
      ...typography.bold,
      color: colors.white_snow,
      fontSize: 16,
    },
    bodySemiBold: {
      ...typography.semiBold,
      color: colors.white_snow,
      fontSize: 16,
    },
    bodyItalic: {
      ...typography.italic,
      color: colors.white_snow,
      fontSize: 16,
    },
    bodyBoldItalic: {
      ...typography.boldItalic,
      color: colors.white_snow,
      fontSize: 16,
    },
    placeholder: {
      ...typography.regular,
      color: colors.keet_grey_200,
      fontSize: 16,
    },
    tag: {
      ...typography.bold,
      color: colors.white_snow,
      textTransform: 'uppercase',
      fontSize: 12,
    },
    reply: {
      ...typography.regular,
      color: colors.white_snow,
      fontSize: 12,
    },
    replyBold: {
      ...typography.bold,
      color: colors.white_snow,
      fontSize: 12,
    },
    flag: {
      ...typography.regular,
      color: colors.highway_gray3,
      textTransform: 'uppercase',
      fontSize: 11,
    },
    inlineCode: {
      ...typography.mono,
      color: colors.yellow_500,
    },
    code: {},
    codeBlock: {
      ...typography.mono,
      color: colors.white_snow,
    },
    greyText: {
      color: colors.text_grey,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 21,
    },
  },
  icon: {
    size: 30,
    closeColor: colors.white_snow,
  },
  border: {
    width: 1,
    color: colors.highway_gray2,
    colorFocus: colors.peer_green,
    radiusSmall: 4,
    radiusNormal: 8,
    radiusLarge: 12,
  },
  spacing: {
    normal: UI_SIZE_8,
    standard: UI_SIZE_16,
    large: UI_SIZE_32,
  },
  animation: {
    ms: 150,
  },
  modal: {
    bg: colors.keet_grey_800,
    borderColor: colors.keet_grey_800,
  },
  background: {
    bg_1: colors.keet_grey_900,
    bg_2: colors.keet_grey_800,
  },
  bars: {
    navigationBarHeight: 44,
    bottomTabBarHeight: 8 + 52 + 8,
  },
  button: {
    height: 54,
    textColor: '#fff',
    successColor: '#95E6CB',
    warnColor: '#FFCC66',
    dangerColor: '#FFA597',
    borderColor: colors.highway_gray2,
  },
  progress: {
    mainColor: '#95E6CB',
    darkerColor: '#1D6E5333',
  },
  reactions: {
    active: colors.keet_purple_1,
    mine: colors.keet_blue_1,
    other: colors.keet_grey_600,
  },
  memberTypes: {
    admin: colors.green_300,
    mod: colors.fuschia_500,
    mine: colors.indigo_400,
    blocked: colors.red_400,
  },
}

/**
 * Stylesheet
 */

interface Store {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const useStore = create<Store>((set) => ({
  theme: mainTheme,
  setTheme: (theme) => {
    set({ theme })
  },
}))

export const getTheme = (): Theme => useStore.getState().theme
export const setTheme = (theme: Theme) => {
  useStore.getState().setTheme(theme)
}
export const useTheme = (): Theme => useStore(({ theme }) => theme)

export const createThemedStylesheet = <T extends object>(
  builder: (theme: Theme) => T,
) => {
  return () => {
    const theme = useTheme()
    const stylesheet = useMemo(() => builder(theme), [theme])
    return stylesheet
  }
}

export const createThemedStylesheetWithHooks = <
  T extends object,
  Output extends object,
>(
  builder: (theme: Theme, hooksOutput: Output) => T,
  hooks: () => Output,
) => {
  return () => {
    const theme = useTheme()
    const hooksOutput = hooks()
    const stylesheet = useMemo(
      () => builder(theme, hooksOutput),
      [hooksOutput, theme],
    )
    return stylesheet
  }
}

export const waitForAnimations = async (cb?: () => void) => {
  await new Promise<void>((resolve) => {
    // eslint-disable-next-line clean-timer/assign-timer-id
    setTimeout(cb ?? resolve, getTheme().animation.ms * 2)
  })
}

export const useReanimatedLayoutAnimation = (fadeWithDirection = true) => {
  const theme = useTheme()
  const duration = theme.animation.ms
  return {
    layout: Layout.duration(duration),
    entering: (fadeWithDirection ? FadeInRight : FadeIn).duration(duration),
    exiting: (fadeWithDirection ? FadeOutLeft : FadeOut).duration(duration),
  }
}
