import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { Loading } from 'component/Loading'
import { createThemedStylesheet } from 'component/theme'
import s, { ICON_SIZE_64 } from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export const RoomListSearching = () => {
  const strings = useStrings()
  const styles = getStyles()

  return (
    <View style={[s.container, s.centeredLayout]}>
      <View style={styles.loadingContainer}>
        <Loading />
      </View>
      <Text style={styles.placeholderBody}>{strings.lobby.searching}</Text>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    loadingContainer: {
      height: ICON_SIZE_64,
    },
    placeholderBody: {
      ...theme.text.body,
      ...s.textAlignCenter,
      marginTop: theme.spacing.standard,
      maxWidth: '80%',
      opacity: 0.5,
    },
  })
  return styles
})
