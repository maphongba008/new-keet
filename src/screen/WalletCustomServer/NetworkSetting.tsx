import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'

import { TextButton, TextButtonType } from 'component/Button'
import Notice from 'component/Notice'
import { createThemedStylesheet, useTheme } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, {
  UI_SIZE_2,
  UI_SIZE_4,
  UI_SIZE_14,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { NETWORK_TYPES } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

import { WalletNetworkConfigI } from './CustomServerSetup'

function NetworkSetting({
  chainNetwork,
  currentNetwork,
  onNetworkConnect,
}: Pick<
  WalletNetworkConfigI,
  'chainNetwork' | 'currentNetwork' | 'onNetworkConnect'
>) {
  const theme = useTheme()
  const styles = getStyles()
  const {
    wallet: { network: strings },
  } = useStrings()

  const [networkHost, setNetworkHost] = useState('')
  const [port, setPort] = useState('')
  const [indexerWs, setIndexerWs] = useState('')

  const buttonDisabled = useMemo(
    () =>
      !networkHost ||
      !port ||
      (chainNetwork === NETWORK_TYPES.ETH && !indexerWs),
    [chainNetwork, indexerWs, networkHost, port],
  )

  const onPressConnect = useCallback(
    () => onNetworkConnect?.({ networkHost, port, indexerWs }),
    [indexerWs, networkHost, onNetworkConnect, port],
  )

  const handleFormSubmit = useCallback(() => {
    if (!buttonDisabled) {
      onPressConnect()
    }
  }, [buttonDisabled, onPressConnect])

  return (
    <View style={[s.flexSpaceBetween, s.fullHeight]}>
      <View style={s.container}>
        <Text style={styles.placeholder}>{strings.host}</Text>
        <TextInput
          style={styles.inputStyle}
          placeholder={strings.hostPlaceholder}
          autoCorrect={false}
          autoCapitalize="none"
          placeholderTextColor={theme.color.grey_300}
          value={networkHost}
          onChangeText={setNetworkHost}
          {...appiumTestProps(APPIUM_IDs.wallet_custom_server_host_input)}
        />
        <Text style={styles.placeholder}>{strings.port}</Text>
        <TextInput
          style={styles.inputStyle}
          placeholder={strings.portPlaceholder}
          autoCorrect={false}
          placeholderTextColor={theme.color.grey_300}
          value={port}
          onChangeText={setPort}
          returnKeyType={
            chainNetwork === NETWORK_TYPES.BTC ? 'done' : undefined
          }
          onSubmitEditing={handleFormSubmit}
          {...appiumTestProps(APPIUM_IDs.wallet_custom_server_port_input)}
        />
        {chainNetwork === NETWORK_TYPES.ETH && (
          <>
            <Text style={styles.placeholder}>{strings.indexerWs}</Text>
            <TextInput
              style={styles.inputStyle}
              placeholder={strings.indexerPlaceholder}
              autoCorrect={false}
              autoCapitalize="none"
              placeholderTextColor={theme.color.grey_300}
              value={indexerWs}
              onChangeText={setIndexerWs}
              returnKeyType="done"
              onSubmitEditing={handleFormSubmit}
              {...appiumTestProps(
                APPIUM_IDs.wallet_custom_server_eth_indexer_input,
              )}
            />
          </>
        )}
        <Notice label={strings.whatAreCcy.replace('$0', currentNetwork)} />
      </View>
      <TextButton
        onPress={onPressConnect}
        text={strings.connect}
        type={
          !buttonDisabled ? TextButtonType.primary : TextButtonType.disabled
        }
        disabled={buttonDisabled}
        {...appiumTestProps(APPIUM_IDs.wallet_custom_server_connect_btn)}
      />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    inputStyle: {
      ...theme.text.body,
      backgroundColor: theme.color.grey_600,
      borderRadius: theme.border.radiusNormal,
      fontSize: 15,
      height: 42,
      marginBottom: theme.spacing.standard,
      paddingHorizontal: theme.spacing.standard,
      paddingRight: UI_SIZE_32 + UI_SIZE_4,
      paddingVertical: theme.spacing.normal + UI_SIZE_2,
    },
    placeholder: {
      ...theme.text.bodySemiBold,
      ...theme.text.greyText,
      fontSize: UI_SIZE_14,
      marginBottom: theme.spacing.normal,
    },
  })
  return styles
})

export default NetworkSetting
