import React, { useCallback, useRef, useState } from 'react'
import { Animated, StyleSheet, View } from 'react-native'

import GestureContainer from 'component/GestureContainer'
import { BackButton, NavBar, ScreenSystemBars } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import SelectTransferType from './SelectTransferType'
import { WALLET_TRANSFER_TYPES, WalletTypeI } from './types'
import WalletTransferForm from './WalletTransferForm'

function WalletTransfer() {
  const styles = getStyles()
  const {
    wallet: { send: strings },
  } = useStrings()
  const heightOffset = useRef(new Animated.Value(0)).current

  const [selectedWalletType, setSelectedWalletType] =
    useState<WalletTypeI>(null)

  const handleAnimatedSelect = useCallback(
    (type: WalletTypeI) => {
      heightOffset.setValue(0)
      setSelectedWalletType(type)
      Animated.spring(heightOffset, {
        toValue: 1,
        useNativeDriver: false,
      }).start()
    },
    [heightOffset],
  )

  const handleGoBack = useCallback(() => {
    if (selectedWalletType !== null) {
      setSelectedWalletType(null)
      return
    }
    return back()
  }, [selectedWalletType])

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar
        title={strings.title}
        right={null}
        left={<BackButton overrideOnPress={handleGoBack} />}
      />
      <View style={[s.container, styles.root]}>
        {typeof selectedWalletType !== 'number' && !selectedWalletType ? (
          <SelectTransferType onSelectType={handleAnimatedSelect} />
        ) : (
          <WalletTransferForm
            heightOffset={heightOffset}
            isCryptoTransaction={
              selectedWalletType === WALLET_TRANSFER_TYPES.CRYPTO_WALLET
            }
          />
        )}
      </View>
    </GestureContainer>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    root: {
      marginTop: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_16,
    },
  })
  return styles
})

export default WalletTransfer
