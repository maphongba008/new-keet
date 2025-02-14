import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useDispatch } from 'react-redux'

import {
  // @ts-ignore
  removeRoomAvatar,
  // @ts-ignore
  ROOM_AVATAR_UPLOAD_KEY,
  // @ts-ignore
  updateRoomAvatar,
} from '@holepunchto/keet-store/store/room'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, { ICON_SIZE_16 } from 'lib/commonStyles'
import { pickAndSetAvatar } from 'lib/media'
import { set as setUpload, UploadFile } from 'lib/uploads'

import { useStrings } from 'i18n/strings'

export interface RoomAvatarSheetProps {
  roomId: string
}

const RoomAvatarBottomSheet = ({ roomId }: RoomAvatarSheetProps) => {
  const strings = useStrings()
  const styles = getStyles()
  const theme = useTheme()
  const dispatch = useDispatch()

  const updateAvatar = useCallback(() => {
    pickAndSetAvatar(
      { fromCamera: false },
      (base64, { width, height, size, path }) => {
        const file: UploadFile = {
          id: ROOM_AVATAR_UPLOAD_KEY,
          path,
          type: 'image/webp',
          dimensions: { width, height },
          byteLength: size,
          avatar: `data:image/webp;base64,${base64}`,
        }
        setUpload(ROOM_AVATAR_UPLOAD_KEY, file, roomId)
        dispatch(updateRoomAvatar(roomId))
      },
      true,
    ).then(closeBottomSheet)
  }, [roomId, dispatch])

  const removeAvatar = useCallback(() => {
    dispatch(removeRoomAvatar(roomId))
    closeBottomSheet()
  }, [roomId, dispatch])

  return (
    <>
      <TouchableOpacity onPress={updateAvatar}>
        <View style={[s.centerAlignedRow, styles.container]}>
          <SvgIcon
            name="image"
            color={theme.text.body.color}
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
            style={styles.networkInlineIcon}
          />
          <Text style={styles.text}>{strings.account.choosePhoto}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={removeAvatar}>
        <View style={[s.centerAlignedRow, styles.container]}>
          <SvgIcon
            name="trash"
            color={theme.text.body.color}
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
            style={styles.networkInlineIcon}
          />
          <Text style={styles.text}>{strings.account.removePhoto}</Text>
        </View>
      </TouchableOpacity>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.standard,
    },
    networkInlineIcon: {
      marginRight: theme.spacing.standard,
    },
    text: {
      ...theme.text.body,
    },
  })
  return styles
})

export default RoomAvatarBottomSheet
