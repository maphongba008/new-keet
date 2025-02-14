import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { StyleSheet, Text } from 'react-native'
import { useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'

import {
  getRoomAllPairing,
  PairingRoom,
} from '@holepunchto/keet-store/store/room'

import { NavBar } from 'component/NavBar'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_4, UI_SIZE_12 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { PairingItem } from './PairingRoomItem'

const PairingRoomsListHeader = memo(({ count }: { count: number }) => {
  const styles = getStyles()
  const strings = useStrings()
  return (
    <Text style={styles.title}>
      {(count === 1
        ? strings.lobby.joiningRoomTitle
        : strings.lobby.joiningRoomTitlePlural
      ).replace('$0', String(count))}
    </Text>
  )
})

const PairingRoomsList = memo(() => {
  const styles = getStyles()
  const strings = useStrings()
  const pairingRooms = useSelector(getRoomAllPairing)
  const count = pairingRooms.length

  useEffect(() => {
    if (count === 0) {
      back()
    }
  }, [count])

  const keyExtractor = useCallback((item: PairingRoom) => item.seedId, [])

  interface Prop {
    item: PairingRoom
  }
  const renderItem = useCallback(({ item }: Prop) => {
    return <PairingItem seedId={item.seedId} />
  }, [])

  const headerComponent = useMemo(
    () => <PairingRoomsListHeader count={count} />,
    [count],
  )

  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title={strings.lobby.joiningRoom} />
      <FlashList
        data={pairingRooms}
        ListHeaderComponent={headerComponent}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={64}
        contentContainerStyle={styles.root}
      />
    </SafeAreaView>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    root: {
      paddingHorizontal: UI_SIZE_12,
    },
    title: {
      ...theme.text.title2,
      color: theme.color.grey_200,
      marginVertical: UI_SIZE_4,
    },
  })
  return styles
})

export default PairingRoomsList
