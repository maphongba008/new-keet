import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import roomsApi from '@holepunchto/keet-store/api/rooms'
import {
  getRoomPairingItemBySeedId,
  PAIRING_STATUS,
  PairingRoom,
  roomPairCancel,
} from '@holepunchto/keet-store/store/room'

import {
  closeBottomSheet,
  showBottomSheet,
} from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { TextButtonType } from 'component/Button'
import { CloseButton } from 'component/CloseButton'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  ICON_SIZE_16,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_20,
  UI_SIZE_42,
} from 'lib/commonStyles'
import { useConfig } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

export const RoomNew = () => {
  const styles = getStyles()
  const strings = useStrings()
  return (
    <Text style={[styles.roomDescriptionText, s.container]}>
      {strings.lobby.joining}
    </Text>
  )
}

export const RoomAsked = () => {
  const styles = getStyles()
  const strings = useStrings()
  return (
    <Text style={[styles.roomDescriptionText, s.container]}>
      {strings.lobby.askedJoining}
    </Text>
  )
}
const { useSubscribeChatLengthQuery } = roomsApi

export const RoomPaired = ({ room }: { room: PairingRoom }) => {
  const styles = getStyles()
  const strings = useStrings()
  const { data: numOfMessagesLoaded } = useSubscribeChatLengthQuery({
    roomId: room.roomId,
  })
  const { title } = useConfig(room.roomId)
  if (!room.roomId) {
    return null
  }
  return (
    <View style={s.container}>
      <Text style={styles.roomDescriptionText}>{title}</Text>
      <Text style={styles.loadingText}>
        {(numOfMessagesLoaded === 1
          ? strings.lobby.numOfMessageLoaded
          : strings.lobby.numOfMessageLoadedPlural
        ).replace('$0', numOfMessagesLoaded || 0)}
      </Text>
    </View>
  )
}

export const RoomExpired = () => {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  return (
    <View style={s.container}>
      <View style={[styles.failedContainer, s.row, s.alignItemsCenter]}>
        <SvgIcon
          name="info"
          width={ICON_SIZE_16}
          height={ICON_SIZE_16}
          color={theme.color.red_400}
        />
        <Text style={styles.itemExpiredText}>
          {strings.lobby.pairingFailed}
        </Text>
      </View>
      <Text style={[styles.roomDescriptionText, styles.itemExpiredDescription]}>
        {strings.lobby.pairingExpired}
      </Text>
    </View>
  )
}

export const PairingItem = ({ seedId }: { seedId: string }) => {
  const styles = getStyles()
  const strings = useStrings()
  const theme = useTheme()
  const room: PairingRoom = useSelector(getRoomPairingItemBySeedId(seedId))
  const dispatch = useDispatch()
  const handleCancelPairing = useCallback(() => {
    if (room.status === PAIRING_STATUS.EXPIRED) {
      // for expired room, we don't need to ask for confirmation
      dispatch(roomPairCancel(room.seedId))
      return
    }
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.Dialog,
      title: strings.lobby.cancelPairing,
      description: strings.lobby.cancelPairingDesc,
      buttons: [
        {
          text: strings.lobby.cancelPairingConfirm,
          onPress: () => {
            dispatch(roomPairCancel(room.seedId))
            closeBottomSheet()
          },
          type: TextButtonType.danger,
        },
        {
          text: strings.lobby.cancelPairingCancel,
          onPress: closeBottomSheet,
          type: TextButtonType.cancel,
        },
      ],
    })
  }, [
    dispatch,
    room.seedId,
    room.status,
    strings.lobby.cancelPairing,
    strings.lobby.cancelPairingCancel,
    strings.lobby.cancelPairingConfirm,
    strings.lobby.cancelPairingDesc,
  ])
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemEmptyAvatar}>
        <SvgIcon name="newVersion" width={UI_SIZE_20} height={UI_SIZE_20} />
      </View>
      {room.status === PAIRING_STATUS.NEW && <RoomNew />}
      {room.status === PAIRING_STATUS.ASKED && <RoomAsked />}
      {room.status === PAIRING_STATUS.EXPIRED && <RoomExpired />}
      {room.status === PAIRING_STATUS.PAIRED && <RoomPaired room={room} />}
      {room.status !== PAIRING_STATUS.ASKED && (
        <CloseButton
          onPress={handleCancelPairing}
          color={theme.color.grey_300}
          width={ICON_SIZE_16}
          height={ICON_SIZE_16}
          style={styles.itemEmptyCancelButton}
        />
      )}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    failedContainer: {
      paddingHorizontal: UI_SIZE_16,
    },
    itemEmptyAvatar: {
      ...s.centeredLayout,
      backgroundColor: theme.color.grey_300,
      borderRadius: UI_SIZE_42 / 2,
      height: UI_SIZE_42,
      width: UI_SIZE_42,
    },
    itemEmptyCancelButton: {
      padding: UI_SIZE_12,
    },
    itemExpiredDescription: {
      ...theme.text.body,
      fontSize: UI_SIZE_14,
    },
    itemExpiredText: {
      ...theme.text.body,
      color: theme.color.red_400,
      fontSize: UI_SIZE_14,
      marginLeft: UI_SIZE_8,
    },
    itemRow: {
      ...s.centerAlignedRow,
      height: 64,
      marginTop: UI_SIZE_8,
    },
    loadingText: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_12,
      marginHorizontal: UI_SIZE_16,
    },
    roomDescriptionText: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_14,
      marginHorizontal: UI_SIZE_16,
    },
  })
  return styles
})
