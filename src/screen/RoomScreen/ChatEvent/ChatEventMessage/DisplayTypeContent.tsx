import React, { memo, useCallback, useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

import { DISPLAY_TYPES } from '@holepunchto/keet-core-api'
import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import { getMemberNotFoundIds } from '@holepunchto/keet-store/store/member'

import { createThemedStylesheet, useTheme } from 'component/theme'
import { DIRECTION_CODE, UI_SIZE_2, UI_SIZE_4 } from 'lib/commonStyles'
import { isAndroid } from 'lib/platform'
import { getMessageCellAvailableWidth } from 'lib/size'
import { Fragment } from 'lib/types'

import { DisplayTypeContext } from './DisplayTypeContext'
import DisplayTypeEmoji from './DisplayTypeEmoji'
import DisplayTypeMention from './DisplayTypeMention'

interface DisplayTypeContentProps {
  style: { type: number; content: string }
  content: string | React.JSX.Element
  fragment: Fragment
}

const ZERO_WIDTH_SPACE = '\u200B'

const DisplayTypeContent = memo(
  ({ style, content, fragment }: DisplayTypeContentProps) => {
    const theme = useTheme()
    const styles = getStyles()
    const {
      roomId: previewRoomId,
      onPress,
      onLongPress,
      textStyle,
      forPreview,
    } = useContext(DisplayTypeContext)
    const key = fragment.start + content.toString() + fragment.end
    const { type, content: fragmentContent } = style
    const roomId = useSelector(getAppCurrentRoomId)
    const isLobbyPreview = !roomId || forPreview
    const notFoundMemberIds = useSelector(getMemberNotFoundIds(roomId))

    const handleLink = useCallback(() => {
      onPress?.(fragmentContent)
    }, [fragmentContent, onPress])

    const handleLongPress = useCallback(() => {
      onLongPress?.()
    }, [onLongPress])

    switch (type) {
      case DISPLAY_TYPES.BOLD:
        return (
          <Text key={key} style={[theme.text.bodyBold, textStyle]}>
            {content}
          </Text>
        )

      case DISPLAY_TYPES.ITALIC: {
        // For android nested bold and italic text styles do not apply well, need to give specific font family.
        const parentStyleType = (content as React.JSX.Element)?.props?.style
          ?.type
        if (isAndroid && parentStyleType === DISPLAY_TYPES.BOLD) {
          const parentContent = (content as React.JSX.Element)?.props?.content
          return (
            <Text key={key} style={[theme.text.bodyBoldItalic, textStyle]}>
              {parentContent}
            </Text>
          )
        }

        return (
          <Text
            key={key}
            style={[theme.text.bodyItalic, styles.italicStyle, textStyle]}
          >
            {content}
          </Text>
        )
      }

      case DISPLAY_TYPES.STRIKE_THROUGH:
        return (
          <Text
            key={key}
            style={[theme.text.body, styles.strikeThrough, textStyle]}
          >
            {content}
          </Text>
        )

      case DISPLAY_TYPES.PEAR_LINK:
      case DISPLAY_TYPES.HTTP_LINK: {
        // On Android, long URLs without spaces (like pear:// links) don't wrap properly and stay on a single line.
        // We split the URL and add a Zero-Width Space character (\u200B) after the protocol separator.
        // This invisible character allows line breaks while preserving the link functionality and appearance.
        // The \u200B character is perfect for this case because:
        // 1. It's completely invisible to users
        // 2. It doesn't affect link parsing
        // 3. It provides a valid break point for text wrapping on Android
        const contentStr = content.toString()
        const [protocol, path] = contentStr.split('://')

        return (
          <Text
            key={key}
            style={[styles.link, textStyle]}
            onPress={!isLobbyPreview ? handleLink : undefined}
            onLongPress={!isLobbyPreview ? handleLongPress : undefined}
          >
            {/* When content contains URI without scheme, path will be undefined and protocol will contain full URI */}
            {path ? `${protocol}://${ZERO_WIDTH_SPACE}${path}` : protocol}
          </Text>
        )
      }

      case DISPLAY_TYPES.MENTION: {
        const memberId = fragmentContent.split('/')?.[0]

        if (notFoundMemberIds.includes(memberId)) {
          return <Text style={[styles.link, textStyle]}>{content}</Text>
        }

        return (
          <DisplayTypeMention
            roomId={previewRoomId ?? roomId}
            memberId={memberId}
            content={content}
          />
        )
      }

      case DISPLAY_TYPES.CODE: {
        return (
          <Text
            key={key}
            style={[textStyle, styles.inlineCode]}
            numberOfLines={forPreview ? 2 : undefined}
          >
            {content}
          </Text>
        )
      }

      case DISPLAY_TYPES.CODE_BLOCK: {
        if (forPreview) {
          return (
            <Text key={key} style={[styles.codeBlock, textStyle]}>
              {content}
            </Text>
          )
        }

        return (
          <View key={key} style={styles.codeBlockContainer}>
            <Text style={[styles.codeBlock, textStyle]}>{content}</Text>
          </View>
        )
      }

      case DISPLAY_TYPES.EMOJI: {
        return <DisplayTypeEmoji key={key} code={fragmentContent} />
      }

      default:
        return content
    }
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    codeBlock: {
      ...theme.text.codeBlock,
      padding: theme.spacing.standard / UI_SIZE_2,
      writingDirection: DIRECTION_CODE,
    },
    codeBlockContainer: {
      backgroundColor: theme.color.bg3,
      borderRadius: UI_SIZE_4,
      maxWidth: isAndroid ? getMessageCellAvailableWidth() - 40 : '100%',
    },
    inlineCode: {
      ...theme.text.inlineCode,
      backgroundColor: theme.color.grey_600,
      marginRight: 0,
      writingDirection: DIRECTION_CODE,
    },
    italicStyle: {
      fontStyle: 'italic',
    },
    link: {
      color: theme.color.blue_400,
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    strikeThrough: {
      textDecorationLine: 'line-through',
    },
  })
  return styles
})

export default DisplayTypeContent
