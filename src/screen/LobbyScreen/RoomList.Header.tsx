import React, { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'

import { getIsIdentityComplete } from '@holepunchto/keet-store/store/identity'
import {
  getDmRequests,
  getRoomPairingCount,
} from '@holepunchto/keet-store/store/room'

import { createThemedStylesheet } from 'component/theme'
import { UI_SIZE_8 } from 'lib/commonStyles'

import DMRequests from './DMRequests'
import { RoomListFilter } from './RoomList.Filter'
import RoomListPairingTitle from './RoomsPairing.Title'

export const RoomListHeader = () => {
  const styles = getStyles()
  const isIdentityComplete = useSelector(getIsIdentityComplete)
  const dmRequests = useSelector(getDmRequests)
  const pairingRoomsCount = useSelector(getRoomPairingCount)
  const showDm = useMemo(
    () => isIdentityComplete && dmRequests.length > 0,
    [isIdentityComplete, dmRequests],
  )
  const containerStyle = useMemo(
    () => pairingRoomsCount > 0 && showDm,
    [pairingRoomsCount, showDm],
  )
  return (
    <View style={containerStyle && styles.wrapper}>
      <RoomListPairingTitle />
      {showDm && <DMRequests />}
      <RoomListFilter />
    </View>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    wrapper: {
      marginTop: UI_SIZE_8,
    },
  })
  return styles
})
