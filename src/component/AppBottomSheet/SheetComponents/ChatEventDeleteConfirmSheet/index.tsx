import { memo, useCallback } from 'react'
import { StyleSheet, Text } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import { useRemoveChatMessage } from 'screen/RoomScreen/Chat.hooks'
import { DIRECTION_CODE, UI_SIZE_16 } from 'lib/commonStyles'
import { ChatEventType } from 'lib/types'

import { useStrings } from 'i18n/strings'

export interface ChatEventDeleteConfirmSheetI {
  roomId: string
  messageId: ChatEventType['id']
}
const ChatEventDeleteConfirmSheet = ({
  roomId,
  messageId,
}: ChatEventDeleteConfirmSheetI) => {
  const removeChatMessage = useRemoveChatMessage({ roomId, messageId })
  const strings = useStrings()
  const styles = getStyles()

  const onPress = useCallback(() => {
    removeChatMessage()
    closeBottomSheet()
  }, [removeChatMessage])

  return (
    <>
      <Text style={styles.titleText}>{strings.room.deleteMessage}</Text>
      <Text style={styles.descriptionText}>
        {strings.room.deleteMessageConfirmHint}
      </Text>
      <TextButton
        text={strings.room.deleteMessageConfirmButton}
        onPress={onPress}
        type={TextButtonType.primary}
        style={styles.confirmButton}
      />
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    confirmButton: {
      marginTop: UI_SIZE_16,
    },
    descriptionText: {
      ...theme.text.body,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
    titleText: {
      ...theme.text.bodyBold,
      marginBottom: theme.spacing.standard,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})

export default memo(ChatEventDeleteConfirmSheet)
