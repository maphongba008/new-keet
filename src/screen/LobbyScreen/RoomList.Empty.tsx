import React, { useCallback } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

import { getRoomListSearchText } from '@holepunchto/keet-store/store/room'

import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'
import { useIsFilterActive } from 'lib/hooks/useLobbyFilter'
import { DISCOVER_COMMUNITY, navigate } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

export const RoomListEmpty = () => {
  const strings = useStrings()
  const styles = getStyles()

  const handlePress = useCallback(() => {
    navigate(DISCOVER_COMMUNITY)
    return
  }, [])

  const roomSearchText: string = useSelector(getRoomListSearchText)
  const isFilterActive = useIsFilterActive()
  if (isFilterActive) {
    return (
      <View style={[s.container, s.centeredLayout]}>
        <Text style={styles.placeholderTitle}>{strings.lobby.emptyFilter}</Text>
      </View>
    )
  }
  return (
    <View style={[s.container, s.centeredLayout]}>
      <View style={styles.wrapper}>
        <SvgIcon width={220} height={116} name="astronaut" />
        <Text style={styles.placeholderTitle}>
          {roomSearchText ? strings.lobby.noResult : strings.lobby.emptyTitle}
        </Text>
        <Pressable onPress={handlePress}>
          <Text style={styles.placeholderBody}>
            {!roomSearchText && strings.discoverCommunities.lobbyLbl}
          </Text>
        </Pressable>
      </View>
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    placeholderBody: {
      ...theme.text.body,
      ...s.textAlignCenter,
      ...s.alignSelfCenter,
      color: theme.color.blue_400,
      marginTop: theme.spacing.normal,
      maxWidth: '80%',
    },
    placeholderTitle: {
      ...theme.text.bodyBold,
      ...s.textAlignCenter,
      marginTop: theme.spacing.standard,
    },
    wrapper: {
      height: 'auto',
    },
  })
  return styles
})
