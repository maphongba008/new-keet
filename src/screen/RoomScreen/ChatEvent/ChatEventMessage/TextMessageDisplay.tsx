import React, { memo, useCallback, useMemo } from 'react'
import { Text, TextStyle } from 'react-native'
import isEqual from 'react-fast-compare'

import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'

import ShowAllTextButton from 'component/ShowAllTextButton'
import { useTheme } from 'component/theme'
import { truncateText } from 'screen/RoomScreen/hooks/useGetProcessedMarkDownText'
import { CHAT_BUBBLE_MAX_CHAR } from 'lib/constants'
import { StyledFragments } from 'lib/types'

import { DisplayTypeContext } from './DisplayTypeContext'
import { getTextMessageDisplayStyle } from './helpers/getTextMessageDisplayStyle'

interface BasePreviewProps {
  roomId?: string
  memberId?: string
  textStyle?: TextStyle[] | TextStyle
  isSingleEmoji?: boolean
}

interface TextMessageDisplayProps extends BasePreviewProps {
  messageId: string
  text?: string
  styledFragments: StyledFragments | undefined
  onPress?: (url: string) => void
  onLongPress?: () => void
  sender?: string
  forPreview?: boolean
  displayWithoutFormatting?: boolean
  expanded?: boolean
}

const TextMessageDisplay = ({
  roomId,
  memberId,
  messageId,
  text = '',
  styledFragments,
  onPress,
  onLongPress,
  sender,
  textStyle,
  forPreview,
  displayWithoutFormatting,
  expanded,
}: TextMessageDisplayProps) => {
  const theme = useTheme()
  const truncated = text.length > CHAT_BUBBLE_MAX_CHAR
  const finalText = truncated ? truncateText(text) : text

  const emojis = useMemo(
    () =>
      styledFragments?.filter((fragment) => {
        return fragment.styles[0]?.type === DISPLAY_TYPES.EMOJI
      }, 0),
    [styledFragments],
  )

  const isSingleEmoji = useMemo(
    () =>
      emojis?.length === 1 &&
      text.slice(emojis[0]?.start, emojis[0]?.end) === text.trim(),
    [emojis, text],
  )

  const context = useMemo(
    () => ({
      roomId,
      onPress,
      onLongPress,
      forPreview,
      textStyle,
      isSingleEmoji,
    }),
    [forPreview, isSingleEmoji, onLongPress, onPress, roomId, textStyle],
  )

  const getStyledText = useCallback(
    (fragments: StyledFragments) => {
      return getTextMessageDisplayStyle(
        fragments,
        expanded ? text : finalText,
        theme,
        textStyle,
        messageId,
      )
    },
    [expanded, finalText, text, theme, textStyle, messageId],
  )

  return (
    <>
      <DisplayTypeContext.Provider value={context}>
        <Text
          style={textStyle ?? theme.text.body}
          ellipsizeMode="tail"
          numberOfLines={forPreview ? 2 : undefined}
        >
          {sender && `${sender}: `}
          {styledFragments?.length && !displayWithoutFormatting
            ? getStyledText(styledFragments)
            : text}
        </Text>
      </DisplayTypeContext.Provider>
      {!expanded && truncated && roomId && memberId && (
        <ShowAllTextButton
          roomId={roomId}
          memberId={memberId}
          messageId={messageId}
          text={text}
          fragments={styledFragments}
          onPress={onPress}
        />
      )}
    </>
  )
}

export default memo(TextMessageDisplay, isEqual)
