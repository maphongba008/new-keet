import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

import { WalletUserDetailsI } from 'screen/WalletSendScreen/types'
import s, { UI_SIZE_14 } from 'lib/commonStyles'
import { sanitizeCredentials } from 'lib/wallet'

import SvgIcon from './SvgIcon'
import { createThemedStylesheet } from './theme'

function WalletUserDetails({
  avatarUrl,
  walletAddress,
  isCryptoTransaction,
}: WalletUserDetailsI) {
  const styles = getStyles()

  return (
    <View style={styles.userInfo}>
      {isCryptoTransaction || (!isCryptoTransaction && !avatarUrl) ? (
        <SvgIcon name="userAvatar" width={60} height={60} />
      ) : (
        <Image source={{ uri: avatarUrl! }} style={styles.avatar} />
      )}
      <Text style={styles.receiver}>
        {sanitizeCredentials(walletAddress!, !isCryptoTransaction)}
      </Text>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      borderRadius: 30,
      height: 60,
      width: 60,
    },
    receiver: {
      ...theme.text.body,
      ...s.textAlignCenter,
      marginTop: UI_SIZE_14,
    },
    userInfo: {
      ...s.centeredLayout,
    },
  })
  return styles
})

export default WalletUserDetails
