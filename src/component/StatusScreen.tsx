import React, { memo, useCallback, useMemo } from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_12, UI_SIZE_24 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { useBackHandler } from 'lib/hooks/useBackHandler'

import { useStrings } from 'i18n/strings'

interface StatusScreenI {
  title: string
  subTitle?: string
  btnLabel?: string | null
  btnType?: TextButtonType
  onFinish: () => void
}

const StatusScreen = memo(
  ({
    title,
    subTitle,
    onFinish,
    btnType = TextButtonType.primary,
    btnLabel,
  }: StatusScreenI) => {
    const styles = getStyles()
    const { common: strings } = useStrings()

    const customBtnLabel = useMemo(
      () => (!btnLabel ? strings.finish : btnLabel),
      [btnLabel, strings.finish],
    )

    const onPressBack = useCallback(() => {
      onFinish()
      return true
    }, [onFinish])
    useBackHandler(onPressBack)

    return (
      <>
        <ScreenSystemBars />
        <SafeAreaView style={s.container} edges={SAFE_EDGES}>
          <NavBar left={null} title={null} right={null} />
          <View style={styles.root}>
            <View style={styles.container}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.text}>{subTitle}</Text>
            </View>
            <TextButton
              text={customBtnLabel}
              type={btnType as TextButtonType}
              onPress={onFinish}
              style={styles.button}
              {...appiumTestProps(APPIUM_IDs.create_id_onFinish_btn)}
            />
          </View>
        </SafeAreaView>
      </>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const { width } = Dimensions.get('window')
  const styles = StyleSheet.create({
    button: {
      marginTop: UI_SIZE_12,
    },
    container: {
      ...s.container,
      ...s.centeredLayout,
      gap: UI_SIZE_12,
      paddingHorizontal: 0.05 * width,
    },
    description: {
      ...theme.text.body,
      ...theme.text.subtitle,
      ...theme.text.greyText,
      ...s.textAlignCenter,
    },
    root: {
      ...s.container,
      padding: theme.spacing.standard,
    },
    text: {
      ...theme.text.body,
      ...s.textAlignCenter,
    },
    title: {
      ...theme.text.title,
      ...s.textAlignCenter,
      fontSize: UI_SIZE_24,
    },
  })
  return styles
})

export default StatusScreen
