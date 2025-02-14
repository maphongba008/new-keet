import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import isEqual from 'react-fast-compare'

import { UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'
import { CHAT_BUBBLE_MAX_CHAR } from 'lib/constants'
import { useMember } from 'lib/hooks/useMember'
import { navigate, SCREEN_LONG_TEXT_PREVIEW } from 'lib/navigation'
import { StyledFragments } from 'lib/types'

import { useStrings } from 'i18n/strings'

import SvgIcon from './SvgIcon'
import { createThemedStylesheet, useTheme } from './theme'

const ShowAllTextButton = memo(
  ({
    roomId,
    memberId,
    messageId,
    text = '',
    fragments,
    onPress,
    asPlainText,
  }: {
    roomId: string
    memberId: string
    messageId: string
    text: string
    fragments?: StyledFragments
    onPress?: (url: string) => void
    asPlainText?: boolean
  }) => {
    const theme = useTheme()
    const styles = getStyles()
    const strings = useStrings()
    const { member } = useMember(roomId, memberId)
    const backgroundColor = member.isLocal
      ? theme.color.bg4
      : theme.color.grey_700

    const onPressLongText = useCallback(() => {
      navigate(SCREEN_LONG_TEXT_PREVIEW, {
        memberId,
        messageId,
        text,
        fragments,
        roomId,
        onPress,
        asPlainText,
      })
    }, [asPlainText, fragments, memberId, messageId, text, roomId, onPress])

    return (
      <>
        {text.length > CHAT_BUBBLE_MAX_CHAR && (
          <TouchableOpacity
            onPress={onPressLongText}
            style={[styles.showAllContainer, { backgroundColor }]}
          >
            <Text style={styles.showAllText}>{strings.chat.showAll}</Text>
            <SvgIcon
              name="arrowRight"
              width={UI_SIZE_16}
              height={UI_SIZE_16}
              color={theme.color.blue_400}
            />
          </TouchableOpacity>
        )}
      </>
    )
  },
  isEqual,
)

export default ShowAllTextButton

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    showAllContainer: {
      alignItems: 'center',
      borderRadius: UI_SIZE_8,
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: UI_SIZE_8,
      padding: UI_SIZE_8,
    },
    showAllText: {
      ...theme.text.body,
      color: theme.color.blue_400,
    },
  })
  return styles
})
