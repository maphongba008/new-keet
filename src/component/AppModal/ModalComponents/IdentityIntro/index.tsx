import React, { useCallback } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

import { closeAppModal } from 'reducers/application'

import { TextButton, TextButtonType } from 'component/Button'
import { MarkDown } from 'component/MarkDown'
import { ScreenSystemBars } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_12, UI_SIZE_16, UI_SIZE_24, width } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

const IdentityIntro = () => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()

  const onBottomButtonPress = useCallback(
    () => dispatch(closeAppModal()),
    [dispatch],
  )

  return (
    <>
      <ScreenSystemBars />
      <View style={[s.container, s.justifyEnd]}>
        <SvgIcon
          width={width}
          height={(width * 536) / 393}
          name="backgroundCircles"
        />
      </View>
      <SafeAreaView style={s.absoluteFill}>
        <ScrollView
          contentContainerStyle={styles.introContainer}
          bounces={false}
        >
          <Text style={styles.title}>{strings.profileSetupInfo.title}</Text>
          <MarkDown md={strings.profileSetupInfo.description} />
        </ScrollView>
        <View style={styles.bottomContainer}>
          <Text style={styles.hint}>{strings.profileSetupInfo.hint}</Text>
          <TextButton
            text={strings.on_boarding.getStarted}
            type={TextButtonType.primary}
            onPress={onBottomButtonPress}
          />
        </View>
      </SafeAreaView>
    </>
  )
}

export default IdentityIntro

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    bottomContainer: {
      paddingBottom: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_12,
    },
    hint: {
      ...theme.text.body,
      ...s.textAlignCenter,
      color: theme.color.grey_100,
      marginBottom: UI_SIZE_24,
    },
    introContainer: {
      paddingHorizontal: UI_SIZE_12,
      paddingVertical: UI_SIZE_16,
    },
    title: {
      ...theme.text.title,
      ...s.textAlignCenter,
      color: theme.color.grey_000,
      fontSize: 26,
      marginBottom: UI_SIZE_24,
      marginTop: UI_SIZE_16,
    },
  })
  return styles
})
