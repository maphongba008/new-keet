/* eslint-disable react/jsx-no-bind */
import React, { memo, useCallback, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import ActionButton from 'component/ActionButton'
import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { TextButton, TextButtonType } from 'component/Button'
import MaskGradient from 'component/MaskGradient'
import LabeledRadio from 'component/RadioButton'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, gradient } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_24,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { navigate, SCREEN_CUSTOM_SERVER_SETUP } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

enum WALLET_SERVER_TYPE {
  DEFAULT,
  CUSTOM,
}

type SelectedServerType =
  (typeof WALLET_SERVER_TYPE)[keyof typeof WALLET_SERVER_TYPE]

const { DEFAULT: DEFAULT_SERVER, CUSTOM: CUSTOM_SERVER } = WALLET_SERVER_TYPE

const GetStarted = () => {
  const {
    wallet: { getStarted: strings },
  } = useStrings()
  const styles = getStyles()

  const [selectedServerType, setSelectedServerType] = useState(DEFAULT_SERVER)

  const onPressGetStarted = useCallback(() => {
    if (selectedServerType === DEFAULT_SERVER) {
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.RecoverWalletSheet,
      })
      return
    }
    navigate(SCREEN_CUSTOM_SERVER_SETUP)
  }, [selectedServerType])

  const onPressItem = useCallback(
    (type: SelectedServerType) => setSelectedServerType(type),
    [],
  )

  const renderRightIcon = useCallback(
    (serverType: WALLET_SERVER_TYPE) => {
      return (
        <LabeledRadio
          value={selectedServerType === serverType}
          onChange={() => onPressItem(serverType)}
        />
      )
    },
    [onPressItem, selectedServerType],
  )

  return (
    <View style={styles.getStartedContainer}>
      <View style={s.centeredLayout}>
        <SvgIcon name="walletGetStarted" width={60} height={60} />
      </View>
      <MaskGradient
        linearGradientProps={gradient.keet_gradient_pink}
        MaskElement={
          <Text style={styles.getStartedTitle}>{strings.getStartedTitle}</Text>
        }
      />
      <Text style={styles.getStartedDesc}>{strings.getStartedDesc}</Text>
      <View style={styles.btnWrapper}>
        <ActionButton
          label={strings.default}
          iconLeft="hardDrives"
          iconRight={renderRightIcon(DEFAULT_SERVER)}
          onPressItem={() => onPressItem(DEFAULT_SERVER)}
          {...appiumTestProps(APPIUM_IDs.wallet_default_server_action)}
        />
        <ActionButton
          label={strings.custom}
          iconLeft="filtersVertical"
          iconRight={renderRightIcon(CUSTOM_SERVER)}
          onPressItem={() => onPressItem(CUSTOM_SERVER)}
          {...appiumTestProps(APPIUM_IDs.wallet_custom_server_action)}
        />
      </View>
      <View style={styles.getStartedBtn}>
        <TextButton
          onPress={onPressGetStarted}
          text={strings.getStartedPrompt}
          type={TextButtonType.primary}
          {...appiumTestProps(APPIUM_IDs.wallet_server_get_started)}
        />
      </View>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    btnWrapper: {
      marginTop: theme.spacing.standard,
    },
    getStartedBtn: {
      ...s.justifyCenter,
      marginBottom: UI_SIZE_12,
      marginTop: UI_SIZE_24,
    },
    getStartedContainer: {
      backgroundColor: theme.color.grey_700,
      borderRadius: UI_SIZE_12,
      marginBottom: UI_SIZE_32,
      paddingHorizontal: UI_SIZE_24,
      paddingVertical: UI_SIZE_12,
    },
    getStartedDesc: {
      ...theme.text.body,
      fontSize: 15,
      marginTop: UI_SIZE_8,
      ...s.alignSelfCenter,
      ...s.textAlignCenter,
    },
    getStartedTitle: {
      ...theme.text.title,
      marginTop: UI_SIZE_12,
      ...s.alignSelfCenter,
    },
  })
  return styles
})

export default memo(GetStarted)
