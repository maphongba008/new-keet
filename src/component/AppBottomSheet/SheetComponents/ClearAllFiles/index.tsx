import React, { useCallback, useEffect } from 'react'
import { StyleSheet, Text } from 'react-native'
import prettyBytes from 'pretty-bytes'

import roomsApi from '@holepunchto/keet-store/api/rooms'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { TextButton, TextButtonType } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_16,
  UI_SIZE_12,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { showInfoNotifier } from 'lib/hud'

import { useStrings } from 'i18n/strings'

const { useClearAllFilesMutation } = roomsApi

const TrashIcon = () => {
  const theme = useTheme()
  return (
    <SvgIcon
      color={theme.color.danger}
      width={ICON_SIZE_16}
      height={ICON_SIZE_16}
      name="trash"
    />
  )
}
export interface ClearAllFilesInterface {
  roomId: string
}
const ClearAllFiles = ({ roomId }: ClearAllFilesInterface) => {
  const styles = getStyles()
  const strings = useStrings()
  const [clearAllFiles, { data, isSuccess, isError }] =
    useClearAllFilesMutation({
      removeRecords: false,
    })

  const onConfirm = useCallback(() => {
    clearAllFiles({ roomId })
  }, [clearAllFiles, roomId])

  const onCancel = useCallback(() => closeBottomSheet(), [])

  useEffect(() => {
    if (isSuccess) {
      showInfoNotifier(
        strings.room.filesCleared.replace(
          '$1',
          prettyBytes(data?.bytesCleared || 0),
        ),
      )
    } else if (isError) {
      showInfoNotifier(strings.room.filesClearFailed)
    }
    if (isSuccess || isError) {
      closeBottomSheet()
    }
  }, [
    isSuccess,
    data,
    strings.room.filesCleared,
    isError,
    strings.room.filesClearFailed,
  ])

  return (
    <>
      <Text style={styles.title}>{strings.room.clearFilesTitle}</Text>
      <Text style={styles.body}>{strings.room.clearFilesMessage}</Text>
      <TextButton
        text={strings.room.clearFilesConfirm}
        onPress={onConfirm}
        style={[styles.button, styles.buttonSpacing]}
        icon={TrashIcon}
        type={TextButtonType.danger}
      />
      <TextButton
        text={strings.common.cancel}
        type={TextButtonType.cancel}
        onPress={onCancel}
        style={styles.button}
      />
    </>
  )
}

export default ClearAllFiles

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    body: {
      ...theme.text.body,
      fontSize: 14,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    button: {
      ...s.fullWidth,
    },
    buttonSpacing: {
      marginBottom: UI_SIZE_12,
    },
    title: {
      ...theme.text.title,
      fontSize: UI_SIZE_20,
      marginBottom: theme.spacing.normal,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
