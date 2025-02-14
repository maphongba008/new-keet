import React, { memo } from 'react'
import { StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { AVATAR_SIZE } from 'component/Avatar'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_20 } from 'lib/commonStyles'

export const ChatEventBlockedAvatar = memo(() => {
  const styles = getStyles()
  return (
    <View style={styles.avatar}>
      <SvgIcon name="newVersion" width={UI_SIZE_20} height={UI_SIZE_20} />
    </View>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_500,
      borderRadius: AVATAR_SIZE / 2,
      height: AVATAR_SIZE,
      justifyContent: 'center',
      width: AVATAR_SIZE,
    },
  })
  return styles
})
