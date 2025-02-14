import { ReactRenderer } from 'marked-react'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

import { appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_24,
} from 'lib/commonStyles'

import { mdRenderer as defaultRenderer, MarkDown } from './MarkDown'
import { colors, createThemedStylesheet, useTheme } from './theme'

type Props = {
  label: string
  rightLabelText?: string
  rightLabelOnPress?: () => void
  value: string
  maxLength?: number
  placeholder?: string
  onChangeText: (value: string) => void
  testID?: string
  descriptionMD?: string
  errorMessage?: string
}

export default ({
  label,
  rightLabelText,
  rightLabelOnPress,
  value,
  maxLength,
  placeholder,
  onChangeText,
  testID,
  descriptionMD,
  errorMessage,
}: Props) => {
  const styles = getStyles()
  const theme = useTheme()

  const animatedValue = useSharedValue(0)

  const onFocus = useCallback(
    () => (animatedValue.value = withTiming(1)),
    [animatedValue],
  )
  const onBlur = useCallback(() => {
    if (errorMessage) {
      animatedValue.value = withTiming(2)
      return
    }

    animatedValue.value = withTiming(0)
  }, [animatedValue, errorMessage])
  const inputContainerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      animatedValue.value,
      [0, 1, 2],
      [colors.keet_grey_600, colors.blue_950, colors.red_400],
    ),
  }))

  useEffect(() => {
    if (errorMessage) {
      animatedValue.value = withTiming(2)
      return
    }

    animatedValue.value = withTiming(0)
  }, [animatedValue, errorMessage])

  const mdRenderer = useMemo(
    (): Partial<ReactRenderer> => ({
      ...defaultRenderer,
      // eslint-disable-next-line react/no-unstable-nested-components
      text(text: string) {
        return (
          <Text style={styles.markdownText} key={`${this.elementId}`}>
            {text}
          </Text>
        )
      },
    }),
    [styles.markdownText],
  )
  const renderer = useCallback(() => mdRenderer, [mdRenderer])

  return (
    <View style={styles.container}>
      <View
        style={[s.rowStartCenter, s.flexSpaceBetween, styles.labelContainer]}
      >
        <Text style={styles.label}>{label}</Text>
        {!!rightLabelText && (
          <Pressable hitSlop={UI_SIZE_8} onPress={rightLabelOnPress}>
            <Text style={styles.rightLabelText}>{rightLabelText}</Text>
          </Pressable>
        )}
      </View>
      <Animated.View style={[styles.inputContainer, inputContainerStyle]}>
        <TextInput
          value={value}
          onFocus={onFocus}
          onBlur={onBlur}
          maxLength={maxLength}
          placeholder={placeholder}
          placeholderTextColor={theme.color.grey_300}
          selectionColor={theme.color.blue_400}
          style={styles.input as any}
          onChangeText={onChangeText}
          {...appiumTestProps(testID)}
        />
      </Animated.View>
      {!!errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {!!descriptionMD && <MarkDown md={descriptionMD} renderer={renderer} />}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      marginTop: UI_SIZE_24,
    },
    errorText: {
      ...theme.text.body,
      color: theme.color.red_400,
      fontSize: 13,
      marginBottom: UI_SIZE_4,
    },
    input: {
      ...theme.text.body,
      paddingVertical: UI_SIZE_12,
    },
    inputContainer: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_8,
      borderWidth: 1,
      marginBottom: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_16,
    },
    label: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_200,
      fontSize: UI_SIZE_14,
    },
    labelContainer: {
      marginBottom: UI_SIZE_12,
    },
    markdownText: {
      color: colors.white_snow,
      fontSize: UI_SIZE_14,
      lineHeight: 21,
    },
    rightLabelText: {
      ...theme.text.bodySemiBold,
      color: theme.color.blue_400,
    },
  })
  return styles
})
