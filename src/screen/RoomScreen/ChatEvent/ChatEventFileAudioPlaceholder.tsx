import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import prettyBytes from 'pretty-bytes'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_24,
  ICON_SIZE_32,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { getMessageCellAvailableWidth } from 'lib/size'

import { useStrings } from 'i18n/strings'

interface ChatEventFileAudioPlaceholderType {
  name: string
  byteLength: number
  loading: boolean
  onClick: () => void
}
export const ChatEventFileAudioPlaceholder = memo(
  ({
    name,
    byteLength,
    loading,
    onClick,
  }: ChatEventFileAudioPlaceholderType) => {
    const styles = getStyles()
    const strings = useStrings()

    const onPress = useCallback(() => {
      if (!loading) {
        onClick?.()
      }
    }, [loading, onClick])

    return (
      <ButtonBase
        style={styles.ChatEventFileAudioPlaceholderView}
        onPress={onPress}
        disabled={loading}
      >
        <View style={styles.ChatEventFileAudioPlaceholderComponentView}>
          <SvgIcon
            name="chat_placeholder_audio"
            color={colors.white_snow}
            width={ICON_SIZE_24}
            height={ICON_SIZE_24}
          />
          <View style={s.container}>
            <View style={s.centerAlignedRow}>
              <Text style={styles.editedText}>
                {loading && `${strings.common.loading}...`}
              </Text>
              <Text
                style={styles.audioEditedText}
                numberOfLines={1}
                ellipsizeMode="middle"
              >
                {name}
              </Text>
              <Text style={styles.editedText}>{prettyBytes(byteLength)}</Text>
            </View>
            {!loading && (
              <Text style={styles.audioClearText}>
                {strings.chat.thisFileHasBeenDeleted}
              </Text>
            )}
          </View>
        </View>
        {loading && (
          <Text style={styles.audioLoadingText}>
            {strings.chat.loadingFileAudio}
          </Text>
        )}
      </ButtonBase>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    ChatEventFileAudioPlaceholderComponentView: {
      ...s.alignItemsCenter,
      ...s.row,
    },
    ChatEventFileAudioPlaceholderView: {
      opacity: 1,
      width: getMessageCellAvailableWidth() - UI_SIZE_32,
      ...s.column,
      ...s.alignItemsCenter,
      ...s.justifyCenter,
    },
    audioClearText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 12,
      marginLeft: UI_SIZE_8,
      writingDirection: DIRECTION_CODE,
    },
    audioEditedText: {
      ...theme.text.body,
      flex: 1,
      fontSize: 12,
      writingDirection: DIRECTION_CODE,
    },
    audioLoadingText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 12,
      marginTop: 5,
      textAlign: 'center',
      writingDirection: DIRECTION_CODE,
    },
    audioPlayer: {
      backgroundColor: theme.color.bg2,
      borderRadius: 4,
      minHeight: 50,
      padding: 8,
      ...s.justifyCenter,
      maxWidth: getMessageCellAvailableWidth() - UI_SIZE_16,
    },
    chatEventFileContainer: { alignItems: 'flex-start' },
    editedText: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 12,
      paddingHorizontal: UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
    fileIconOverImage: {
      color: theme.text.body.color,
      elevation: 3,
      shadowColor: colors.black,
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.22,
      shadowRadius: 2.22,
      zIndex: 10,
    },
    fileIconWrapper: {
      ...s.centeredLayout,
      position: 'absolute',
    },
    placeholderIcon: {
      color: theme.color.accent,
      fontSize: ICON_SIZE_32,
    },
    placeholderMessage: {
      ...s.centeredLayout,
      backgroundColor: theme.color.bg2,
      borderRadius: UI_SIZE_14,
      padding: theme.spacing.standard / 2,
      paddingVertical: UI_SIZE_16,
      rowGap: UI_SIZE_8,
    },
    text: {
      ...theme.text.body,
      fontSize: 15,
      letterSpacing: -0.3,
      lineHeight: 21,
      writingDirection: DIRECTION_CODE,
    },
  })
  return styles
})
