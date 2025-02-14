import React, { memo, useCallback } from 'react'
import { Linking, StyleSheet, Text } from 'react-native'
import { useDispatch } from 'react-redux'

import { reportChatMessage } from '@holepunchto/keet-store/store/chat'
// @ts-ignore
import { memberBlockSubmit } from '@holepunchto/keet-store/store/member'

import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_12, UI_SIZE_20 } from 'lib/commonStyles'
import { CSAM_REPORT_URL } from 'lib/constants'
import { ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { closeBottomSheet, showBottomSheet } from '../../AppBottomSheet.Store'
import BottomSheetEnum from '../BottomSheetEnum'

export interface ConfirmInappropriateMessageDialogInterface {
  messageId: ChatEventType['id']
  memberId: string
  reportedMemberId: string
}

const ConfirmInappropriateMessageDialog = ({
  messageId,
  memberId,
  reportedMemberId,
}: ConfirmInappropriateMessageDialogInterface) => {
  const styles = getStyles()
  const strings = useStrings()
  const dispatch = useDispatch()

  const onPressLink = useCallback(() => {
    Linking.openURL(CSAM_REPORT_URL)
  }, [])

  const onBlock = useCallback(() => {
    dispatch(memberBlockSubmit(reportedMemberId))
    closeBottomSheet()
  }, [dispatch, reportedMemberId])

  const onReport = useCallback(() => {
    dispatch(reportChatMessage({ messageId, memberId }))
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.ConfirmDialog,
      title: strings.room.reportContentBlockUserTitle,
      description: strings.room.reportContentBlockUserHint,
      confirmButton: {
        text: strings.room.reportContentBlockUserBlock,
        type: TextButtonType.danger,
        onPress: onBlock,
      },
      buttons: [
        {
          text: strings.room.reportContentBlockUserDone,
          type: TextButtonType.primary,
          onPress: closeBottomSheet,
        },
      ],
    })
  }, [dispatch, memberId, messageId, onBlock, strings])

  const onCancel = useCallback(() => closeBottomSheet(), [])

  return (
    <>
      <Text style={styles.title}>{strings.room.reportContent}</Text>
      <Text style={styles.body}>
        {strings.room.reportContentConfirmHintPart1}
        <Text style={styles.link} onPress={onPressLink}>
          {strings.room.reportContentConfirmHintLinkText}
        </Text>
        {strings.room.reportContentConfirmHintPart2}
      </Text>
      <TextButton
        text={strings.room.reportContentConfirmHintButton}
        onPress={onReport}
        style={[styles.button, styles.buttonSpacing]}
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

export default memo(ConfirmInappropriateMessageDialog)

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
    link: {
      color: theme.color.blue_400,
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
