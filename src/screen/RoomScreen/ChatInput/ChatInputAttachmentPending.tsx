// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/chat-input.js
import React, { FC, memo } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { Loading } from 'component/Loading'
import {
  colors,
  createThemedStylesheet,
  hexToRgbOpacity,
} from 'component/theme'
import { UI_SIZE_2, UI_SIZE_4, UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'
import { CHAT_INPUT_PREVIEW } from 'lib/constants'

export const CHAT_INPUT_FILE_GROUP_ID = 'CHAT_INPUT_FILE'

interface ChatInputAttachmentPendingProps {
  isLinkPreview?: boolean
}

export const ChatInputAttachmentPending: FC<ChatInputAttachmentPendingProps> =
  memo(({ isLinkPreview = false }) => {
    const styles = getStyles()

    return (
      <Pressable style={styles.container} disabled>
        <View
          style={[
            styles.placeholder,
            isLinkPreview && styles.previewPlaceHolder,
          ]}
        >
          <Loading style={styles.loader} />
        </View>
      </Pressable>
    )
  }, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const borderWidth = theme.border.width
  const cancelSize = UI_SIZE_16 + borderWidth * 2
  const paddingTop = UI_SIZE_8

  const styles = StyleSheet.create({
    cancel: {
      backgroundColor: theme.color.grey_600,
      borderColor: theme.color.grey_600,
      borderRadius: UI_SIZE_8 + borderWidth,
      borderWidth,
      height: cancelSize,
      position: 'absolute',
      right: 0,
      width: cancelSize,
    },
    container: {
      height: CHAT_INPUT_PREVIEW.PREVIEW_HEIGHT + paddingTop,
      minWidth: CHAT_INPUT_PREVIEW.PREVIEW_WIDTH + UI_SIZE_8,
      paddingRight: UI_SIZE_8,
      paddingTop,
    },
    image: {
      borderRadius: UI_SIZE_8,
      height: CHAT_INPUT_PREVIEW.PREVIEW_HEIGHT,
      width: CHAT_INPUT_PREVIEW.PREVIEW_WIDTH,
    },
    loader: {
      alignSelf: 'center',
      height: CHAT_INPUT_PREVIEW.LOADER_SIZE,
      width: CHAT_INPUT_PREVIEW.LOADER_SIZE,
    },
    placeholder: {
      borderColor: theme.border.color,
      borderRadius: UI_SIZE_8,
      borderWidth,
      bottom: 0,
      height: CHAT_INPUT_PREVIEW.PREVIEW_HEIGHT,
      left: 0,
      position: 'absolute',
      right: UI_SIZE_8,
      top: paddingTop,
    },
    previewPlaceHolder: {
      height: CHAT_INPUT_PREVIEW.LINK_PREVIEW_WIDTH / 3,
      width: CHAT_INPUT_PREVIEW.LINK_PREVIEW_WIDTH,
    },
    unknown: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
      paddingHorizontal: UI_SIZE_8,
      width: CHAT_INPUT_PREVIEW.UNKNOWN_WIDTH,
    },
    unknownName: {
      color: colors.white_snow,
      fontSize: 8,
      ...theme.text.tag,
      flex: 1,
      paddingLeft: UI_SIZE_8,
      paddingRight: UI_SIZE_16,
    },
    unknownTypeIconContainer: {
      alignItems: 'center',
      backgroundColor: hexToRgbOpacity(theme.color.grey_600, 0.8),
      borderRadius: UI_SIZE_8,
      bottom: UI_SIZE_2,
      justifyContent: 'center',
      left: UI_SIZE_2,
      paddingHorizontal: UI_SIZE_4,
      paddingVertical: UI_SIZE_4,
      position: 'absolute',
    },
  })
  return styles
})
