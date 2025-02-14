import React, { useCallback } from 'react'
import { View } from 'react-native'

import ActionButton from 'component/ActionButton'
import { TextButton, TextButtonType } from 'component/Button'
import LabeledRadio from 'component/RadioButton'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s from 'lib/commonStyles'
import { getPaymentBackend } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

import { WalletNetworkConfigI } from './CustomServerSetup'

function NetworkType({
  chainNetwork,
  onSelectItem,
  onPressContinue,
}: Omit<
  WalletNetworkConfigI,
  'networkMode' | 'heightOffset' | 'currentNetwork'
>) {
  const { common: strings } = useStrings()

  const network = getPaymentBackend().getChainNetworks()
  const buttonDisabled = !chainNetwork

  const renderRightIcon = useCallback(
    (chainType: string, ccy: string) => {
      return (
        <LabeledRadio
          value={chainType === ccy}
          // eslint-disable-next-line react/jsx-no-bind
          onChange={() => onSelectItem(ccy)}
        />
      )
    },
    [onSelectItem],
  )

  return (
    <View style={[s.container, s.flexSpaceBetween]}>
      <View style={s.container}>
        {network.map(({ ccy, label, icon }, i) => (
          <ActionButton
            key={i}
            label={label}
            iconLeft={icon}
            iconRight={renderRightIcon(chainNetwork, ccy)}
            // eslint-disable-next-line react/jsx-no-bind
            onPressItem={() => onSelectItem(ccy)}
          />
        ))}
      </View>
      <TextButton
        onPress={onPressContinue}
        text={strings.continue}
        type={
          !buttonDisabled ? TextButtonType.primary : TextButtonType.disabled
        }
        disabled={buttonDisabled}
        {...appiumTestProps(APPIUM_IDs.wallet_custom_server_connect_btn)}
      />
    </View>
  )
}

export default NetworkType
