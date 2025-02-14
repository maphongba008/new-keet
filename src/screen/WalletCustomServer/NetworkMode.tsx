import React, { useCallback } from 'react'
import { Animated, StyleSheet, Text, View } from 'react-native'

import ActionButton from 'component/ActionButton'
import { TextButton, TextButtonType } from 'component/Button'
import Notice from 'component/Notice'
import LabeledRadio from 'component/RadioButton'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_6, UI_SIZE_8 } from 'lib/commonStyles'
import { getPaymentBackend } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

import { WalletNetworkConfigI } from './CustomServerSetup'

export const isTextStartWithVoicedSound = (text: string) => {
  return /^[aeiouAEIOU]/.test(text)
}

function NetworkMode({
  networkMode: selectedNetworkMode,
  currentNetwork,
  onSelectItem,
  onPressContinue,
}: Omit<WalletNetworkConfigI, 'chainNetwork'>) {
  const styles = getStyles()
  const {
    wallet: { network: strings },
    ...restString
  } = useStrings()

  const networkModes = getPaymentBackend().getNetworkMode()
  const buttonDisabled = !selectedNetworkMode

  const renderRightIcon = useCallback(
    (selectedMode: string, currentMode: string) => {
      return (
        <LabeledRadio
          value={selectedMode === currentMode}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={() => onSelectItem(currentMode)}
        />
      )
    },
    [onSelectItem],
  )

  return (
    <View style={[s.flexSpaceBetween, s.fullHeight]}>
      <Animated.View style={s.container}>
        <Text style={styles.label}>
          {!isTextStartWithVoicedSound(currentNetwork)
            ? strings.selectNetwork_1.replace('$0', currentNetwork)
            : strings.selectNetwork_2.replace('$0', currentNetwork)}
        </Text>
        {networkModes.map((currentMode, i) => (
          <View key={i} style={styles.innerWrapper}>
            <ActionButton
              label={currentMode}
              iconRight={renderRightIcon(selectedNetworkMode, currentMode)}
              // eslint-disable-next-line react/jsx-no-bind
              onPressItem={() => onSelectItem(currentMode)}
              {...appiumTestProps(APPIUM_IDs.wallet_custom_server_set_mode_btn)}
            />
          </View>
        ))}
        <Notice
          label={
            !isTextStartWithVoicedSound(currentNetwork)
              ? strings.whatIs_1.replace('$0', currentNetwork)
              : strings.whatIs_2.replace('$0', currentNetwork)
          }
          styleProp={styles.notice}
        />
      </Animated.View>
      <TextButton
        onPress={onPressContinue}
        text={restString.common.continue}
        type={
          !buttonDisabled ? TextButtonType.primary : TextButtonType.disabled
        }
        disabled={buttonDisabled}
        {...appiumTestProps(APPIUM_IDs.wallet_custom_server_continue_btn)}
      />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    innerWrapper: {
      marginBottom: UI_SIZE_6,
    },
    label: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 13,
      marginBottom: UI_SIZE_8,
    },
    notice: {
      marginTop: UI_SIZE_6,
    },
  })
  return styles
})

export default NetworkMode
