import React, { memo, useCallback, useEffect } from 'react'
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
  type ColorValue,
  type ViewProps,
} from 'react-native'
import isEqual from 'react-fast-compare'
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type AnimatedProps,
} from 'react-native-reanimated'

import { appiumTestProps } from 'lib/appium'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_16,
  ICON_SIZE_20,
  TRANSPARENT,
  UI_SIZE_8,
} from 'lib/commonStyles'

import {
  colorWithAlpha,
  createThemedStylesheet,
  hexToRgbOpacity,
  useTheme,
} from './theme'

export type ButtonBaseProps = Omit<AnimatedProps<ViewProps>, 'testID'> & {
  hint?: string
  disableFade?: boolean
  enabled?: boolean
  onPress?: () => void
  delayLongPress?: number
  onLongPress?: () => void
  disabled?: boolean
  testID?: string
}

export const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable)

export const ButtonBase = memo((props: ButtonBaseProps) => {
  const { hint, disableFade, style, disabled, ...rest } = props
  const theme = useTheme()

  const opacity = useSharedValue(disabled ? 0.5 : 1)
  const duration = theme.animation.ms

  useEffect(() => {
    opacity.value = withTiming(disabled ? 0.5 : 1, { duration })
  }, [disabled, opacity, duration])

  const animatedStyles = useAnimatedStyle(() => ({ opacity: opacity.value }))

  const onPressIn = useCallback(() => {
    if (disableFade === true) {
      return
    }
    opacity.value = withTiming(0.64, { duration })
  }, [disableFade, duration, opacity])

  const onPressOut = useCallback(() => {
    if (disableFade === true) {
      return
    }
    opacity.value = withTiming(1, { duration })
  }, [disableFade, duration, opacity])

  const animatedPressableProps = {
    accessible: true,
    accessibilityHint: hint,
    accessibilityRole: 'button',
    unstable_pressDelay: 5,
    ...appiumTestProps(props.testID),
    onPressIn,
    onPressOut,
    disabled,
    style: [animatedStyles, style],
    ...rest,
  } as AnimatedProps<PressableProps>

  return <AnimatedPressable {...animatedPressableProps} />
}, isEqual)

export const IconButton = memo((props: ButtonBaseProps) => {
  const { style, ...rest } = props
  const styles = getStyles()

  return (
    <ButtonBase
      {...rest}
      style={[s.centeredLayout, styles.buttonBase, style]}
    />
  )
}, isEqual)

export enum TextButtonType {
  link,
  cancel,
  primary,
  primaryOutline,
  primaryTransparentBg,
  secondary,
  gray,
  disabled,
  danger,
  outline,
  dangerTransparentBg,
  secondaryDanger,
}
export const TextButton = (
  props: ButtonBaseProps & {
    text: string
    icon?: React.FC
    type?: TextButtonType
  },
) => {
  const { style, text, type, ...rest } = props
  const styles = getStyles()

  let buttonStyle = {}
  let buttonTextStyle = {}
  switch (type) {
    case TextButtonType.link:
      buttonStyle = styles.textButton__link
      buttonTextStyle = styles.textButtonText__link
      break
    case TextButtonType.cancel:
      buttonStyle = { ...styles.textButton, ...styles.textButton__cancel }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__cancel,
      }
      break
    case TextButtonType.gray:
      buttonStyle = { ...styles.textButton, ...styles.textButton__gray }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__gray,
      }
      break
    case TextButtonType.primary:
      buttonStyle = { ...styles.textButton, ...styles.textButton__primary }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__primary,
      }
      break
    case TextButtonType.primaryOutline:
      buttonStyle = {
        ...styles.textButton,
        ...styles.textButton__primary_outline,
      }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__primary_outline,
      }
      break
    case TextButtonType.secondary:
      buttonStyle = {
        ...styles.textButton,
        ...styles.textButtonNoBorder,
      }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonNoTransform,
      }
      break
    case TextButtonType.secondaryDanger:
      buttonStyle = {
        ...styles.textButton,
        ...styles.textButton__secondary_danger,
      }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__secondary_danger,
      }
      break
    case TextButtonType.primaryTransparentBg:
      buttonStyle = {
        ...styles.textButton,
        ...styles.textButton__primary_outline,
        ...styles.textButtonTransparentBg,
      }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__primary_outline,
      }
      break
    case TextButtonType.dangerTransparentBg:
      buttonStyle = {
        ...styles.textButton,
        ...styles.textButton__danger_outline,
        ...styles.textButtonTransparentBg,
      }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__danger_outline,
      }
      break
    case TextButtonType.disabled:
      buttonStyle = { ...styles.textButton, ...styles.textButton__disabled }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__disabled,
      }
      break
    case TextButtonType.danger:
      buttonStyle = { ...styles.textButton, ...styles.textButton__danger }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__danger,
      }
      break
    case TextButtonType.outline:
      buttonStyle = {
        ...styles.textButton,
        ...styles.textButton__outline,
      }
      buttonTextStyle = {
        ...styles.textButtonText,
        ...styles.textButtonText__outline,
      }
      break
    default:
      buttonStyle = styles.textButton
      buttonTextStyle = styles.textButtonText
      break
  }

  return (
    <ButtonBase {...rest} style={[buttonStyle, style]}>
      {props.icon !== undefined && <props.icon />}
      <Text style={buttonTextStyle}>{text}</Text>
    </ButtonBase>
  )
}

export const OptionButton = (
  props: ButtonBaseProps & { text: string; selected: boolean; textStyle?: any },
) => {
  const { style, textStyle, text, selected, ...rest } = props
  const styles = getStyles()

  return (
    <ButtonBase
      {...rest}
      style={[
        style,
        selected ? styles.optionButtonSelected : styles.optionButton,
      ]}
    >
      <Text
        style={[
          selected ? styles.optionButtonSelectedText : styles.optionButtonText,
          textStyle,
        ]}
      >
        {text}
      </Text>
    </ButtonBase>
  )
}

export interface OutlineButtonIconProps {
  size?: number
  color?: ColorValue
  style: StyleProp<ViewStyle>
}

export interface OutlineButtonProps {
  title: string
  color?: string
  iconColor?: string
  subtitle?: string
  PrimaryIcon?: React.FC<OutlineButtonIconProps>
  SecondaryIcon?: React.FC<OutlineButtonIconProps>
}

export const OutlineButton = (props: ButtonBaseProps & OutlineButtonProps) => {
  const {
    style,
    iconColor,
    color,
    title,
    subtitle,
    PrimaryIcon,
    SecondaryIcon,
    ...rest
  } = props
  const styles = getStyles()

  return (
    <ButtonBase {...rest} style={[styles.outlineButton, style]}>
      <View style={[s.container, s.row, s.alignItemsCenter, s.justifyStart]}>
        {!(PrimaryIcon == null) && (
          <PrimaryIcon
            size={styles.iconStart.width}
            color={iconColor ?? color ?? styles.outlineButtonText.color}
            style={styles.iconStart}
          />
        )}
        <Text
          style={[
            styles.title,
            s.container,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              color: color ?? styles.outlineButtonText.color,
              lineHeight: PrimaryIcon != null ? 21 : 22,
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
      </View>
      <View style={[s.container, s.row, s.alignItemsCenter, s.justifyEnd]}>
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
        {!(SecondaryIcon == null) && (
          <SecondaryIcon
            size={styles.iconEnd.width}
            color={color ?? (styles.outlineButtonText.color as string)}
            style={styles.iconEnd}
          />
        )}
      </View>
    </ButtonBase>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonBase: {
      height: theme.icon.size,
      width: theme.icon.size,
    },
    iconEnd: {
      height: ICON_SIZE_16,
      marginStart: theme.spacing.standard,
      width: ICON_SIZE_16,
    },
    iconStart: {
      height: ICON_SIZE_20,
      marginEnd: theme.spacing.standard,
      width: ICON_SIZE_20,
    },
    optionButton: {
      ...s.centeredLayout,
      backgroundColor: theme.color.bg4,
      borderRadius: theme.border.radiusLarge,
      padding: UI_SIZE_8,
    },
    optionButtonSelected: {
      ...s.centeredLayout,
      backgroundColor: theme.color.blue_400,
      borderRadius: theme.border.radiusLarge,
      padding: UI_SIZE_8,
    },
    optionButtonSelectedText: {
      ...theme.text.body,
      color: theme.color.grey_900,
      ...s.textAlignCenter,
    },
    optionButtonText: {
      ...theme.text.body,
      ...s.textAlignCenter,
    },
    outlineButton: {
      ...s.row,
      ...s.alignItemsCenter,
      ...s.flexSpaceBetween,
      backgroundColor: theme.background.bg_1,
      borderColor: theme.border.color,
      borderRadius: 12,
      borderWidth: theme.border.width,
      height: 54,
      padding: theme.spacing.standard,
    },
    // eslint-disable-next-line react-native/no-unused-styles
    outlineButtonText: {
      color: theme.text.body.color,
    },
    subtitle: {
      ...theme.text.body,
      opacity: 0.4,
      writingDirection: DIRECTION_CODE,
    },
    textButton: {
      backgroundColor: colorWithAlpha(theme.color.blue_400, 0.2),
      borderRadius: theme.border.radiusNormal,
      paddingVertical: theme.spacing.standard,
      ...s.row,
      ...s.centeredLayout,
    },
    textButtonNoBorder: {
      borderWidth: 0,
    },
    textButtonNoTransform: {
      textTransform: 'none',
    },
    textButtonText: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
      marginHorizontal: theme.spacing.standard / 2,
      ...s.uppercase,
      ...s.textAlignCenter,
    },
    textButtonText__cancel: {
      color: theme.text.bodyBold.color,
      textTransform: 'none',
    },
    textButtonText__danger: {
      ...theme.text.bodySemiBold,
      color: theme.color.red_400,
      textTransform: 'none',
    },
    textButtonText__danger_outline: {
      ...theme.text.bodySemiBold,
      color: theme.color.danger,
      textTransform: 'none',
    },
    textButtonText__disabled: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_200,
      textTransform: 'none',
    },
    textButtonText__gray: {
      ...theme.text.bodySemiBold,
      textTransform: 'none',
    },
    textButtonText__link: {
      ...theme.text.bodyBold,
      ...s.uppercase,
      ...s.textAlignCenter,
      color: theme.color.accent,
      marginHorizontal: theme.spacing.standard / 2,
    },
    textButtonText__outline: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
      textTransform: 'none',
    },
    textButtonText__primary: {
      ...theme.text.bodySemiBold,
      color: theme.color.bg,
      textTransform: 'none',
    },
    textButtonText__primary_outline: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
      textTransform: 'none',
    },
    textButtonText__secondary_danger: {
      ...theme.text.bodySemiBold,
      color: theme.color.red_400,
      textTransform: 'none',
    },
    textButtonTransparentBg: {
      backgroundColor: TRANSPARENT,
    },
    textButton__cancel: {
      backgroundColor: theme.color.grey_600,
      borderColor: theme.color.grey_400,
      borderWidth: theme.border.width,
    },
    textButton__danger: {
      backgroundColor: colorWithAlpha(theme.color.red_400, 0.2),
    },
    textButton__danger_outline: {
      ...theme.text.bodySemiBold,
      borderColor: theme.color.danger,
      borderWidth: theme.border.width,
      color: theme.color.danger,
      textTransform: 'none',
    },
    textButton__disabled: {
      backgroundColor: theme.color.grey_400,
    },
    textButton__gray: {
      backgroundColor: theme.color.grey_600,
    },
    textButton__link: {
      ...s.row,
      ...s.centeredLayout,
      paddingVertical: theme.spacing.standard / 2,
    },
    textButton__outline: {
      backgroundColor: TRANSPARENT,
      borderColor: colorWithAlpha(theme.color.blue_400, 0.2),
      borderWidth: theme.border.width,
    },
    textButton__primary: {
      backgroundColor: theme.color.blue_400,
    },
    textButton__primary_outline: {
      backgroundColor: hexToRgbOpacity(theme.color.blue_400, 0.2),
      borderColor: theme.color.blue_400,
      borderWidth: theme.border.width,
    },
    textButton__secondary_danger: {
      backgroundColor: theme.color.red_900,
    },
    title: {
      ...theme.text.body,
      margin: -2,
      minWidth: '70%',
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
