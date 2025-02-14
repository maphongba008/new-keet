import React, { useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { TextButton, TextButtonType } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import s, { DIRECTION_CODE, UI_SIZE_20 } from 'lib/commonStyles'
import { openLink } from 'lib/linking'

import { useStrings } from 'i18n/strings'

export interface ChatLinkConfirmationInterface {
  url: string
}

export const ChatLinkConfirmation = ({
  url,
}: ChatLinkConfirmationInterface) => {
  const styles = getStyles()
  const strings = useStrings()

  const handleOpenLink = useCallback(() => {
    closeBottomSheet()
    openLink(url)
  }, [url])

  const onCancel = useCallback(() => closeBottomSheet(), [])

  return (
    <>
      <Text style={styles.title}>
        {strings.room.chatLinkConfirmation.leavingKeet}
      </Text>
      <Text style={styles.body}>
        {strings.room.chatLinkConfirmation.ifYouTrustThisLink}
      </Text>
      <TouchableOpacity onPress={handleOpenLink} style={styles.linkContainer}>
        <Text style={styles.linkText}>{url}</Text>
      </TouchableOpacity>

      <TextButton
        text={strings.room.chatLinkConfirmation.goBackToKeet}
        type={TextButtonType.outline}
        onPress={onCancel}
        style={styles.button}
      />
    </>
  )
}

export default ChatLinkConfirmation

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    body: {
      color: theme.color.grey_200,
      writingDirection: DIRECTION_CODE,
    },
    button: {
      ...s.fullWidth,
    },
    linkContainer: {
      marginBottom: theme.spacing.standard,
    },
    linkText: {
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
