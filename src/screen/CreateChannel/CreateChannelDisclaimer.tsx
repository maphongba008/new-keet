import React, { useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView } from 'react-native-safe-area-context'

import { TextButton, TextButtonType } from 'component/Button'
import LabeledCheckbox from 'component/Checkbox'
import MaskGradient from 'component/MaskGradient'
import { NavBar, ScreenSystemBars } from 'component/NavBar'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, gradient } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_24,
} from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { navReplace, SCREEN_CREATE_CHANNEL } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

function CreateChannelDisclaimer() {
  const styles = getStyles()
  const strings = useStrings()
  const disclaimerStrings = strings.lobby.roomActions.channelAction.disclaimer

  const [checked, setChecked] = useState(false)

  const onClickButton = useCallback(() => navReplace(SCREEN_CREATE_CHANNEL), [])

  return (
    <>
      <ScreenSystemBars />
      <SafeAreaView style={s.container} edges={SAFE_EDGES}>
        <NavBar title={null} />
        <ScrollView contentContainerStyle={styles.contentContainer}>
          <View style={s.container} />
          <SvgIcon name="channel_disclaimer_icon" style={styles.icon} />
          <View style={s.alignSelfCenter}>
            <MaskGradient
              linearGradientProps={gradient.keet_gradient_pink}
              MaskElement={
                <Text style={styles.title}>{disclaimerStrings.title}</Text>
              }
            />
          </View>
          <Text style={styles.subtitle}>{disclaimerStrings.subtitle}</Text>
          <Text style={styles.ruleListTitle}>
            {disclaimerStrings.ruleListTitle}
          </Text>
          {[
            disclaimerStrings.rule1,
            disclaimerStrings.rule2,
            disclaimerStrings.rule3,
            disclaimerStrings.rule4,
          ].map((rule) => (
            <View key={String(rule)} style={s.centerAlignedRow}>
              <View style={s.centeredLayout}>
                <SvgIcon
                  name="shield"
                  width={UI_SIZE_20}
                  height={UI_SIZE_20}
                  color={colors.keet_primary_blue20}
                />
                <SvgIcon
                  name="check"
                  width={10}
                  height={10}
                  color={colors.blue_400}
                  style={s.absolute}
                />
              </View>

              <Text style={styles.ruleText}>{rule}</Text>
            </View>
          ))}
          <View style={s.container} />
        </ScrollView>
        <View style={styles.bottomContainer}>
          <LabeledCheckbox
            label={disclaimerStrings.moderatorAcknowledged}
            onChange={setChecked}
            value={checked}
            testProps={appiumTestProps(APPIUM_IDs.broadcast_accept_admin)}
          />
          <TextButton
            text={disclaimerStrings.button}
            onPress={onClickButton}
            style={styles.buttonContainer}
            type={checked ? TextButtonType.primary : TextButtonType.gray}
            disabled={!checked}
            {...appiumTestProps(APPIUM_IDs.broadcast_btn_create)}
          />
        </View>
      </SafeAreaView>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    bottomContainer: {
      padding: UI_SIZE_16,
      paddingTop: UI_SIZE_8,
    },
    buttonContainer: {
      marginTop: UI_SIZE_16,
    },
    contentContainer: {
      flexGrow: 1,
      justifyContent: 'flex-end',
      paddingBottom: UI_SIZE_16,
      paddingHorizontal: UI_SIZE_16,
    },
    icon: {
      alignSelf: 'center',
      marginBottom: UI_SIZE_24,
    },
    ruleListTitle: {
      ...theme.text.bodySemiBold,
      fontSize: 14,
      marginTop: UI_SIZE_24,
    },
    ruleText: {
      ...theme.text.body,
      flex: 1,
      fontSize: 14,
      marginHorizontal: UI_SIZE_12,
      marginVertical: UI_SIZE_8,
    },
    subtitle: {
      ...theme.text.body,
      fontSize: 14,
      marginHorizontal: UI_SIZE_16,
      marginTop: UI_SIZE_8,
      textAlign: 'center',
    },
    title: {
      ...theme.text.bodySemiBold,
      fontSize: 18,
    },
  })
  return styles
})

export default CreateChannelDisclaimer
