import React, { memo, useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { Image } from 'expo-image'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { MarkdownPreview } from 'component/MarkdownPreview'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_14,
  UI_SIZE_16,
  UI_SIZE_32,
  UI_SIZE_36,
} from 'lib/commonStyles'
import { getMediaType } from 'lib/fs'
import { useFile } from 'lib/hooks/useFile'
import { ChatEventFileRaw, StyledFragments } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { useGetReplyToOriginalMessage } from './ChatEventMessage/hooks/useGetReplyToOriginalMessage'
import { useScrollToReplyParent } from './ChatEventMessage/hooks/useScrollToReplyParent'
import TextMessageDisplay from './ChatEventMessage/TextMessageDisplay'
import { useFileId } from '../hooks/useFileId'
import { useGetProcessedMarkdownText } from '../hooks/useGetProcessedMarkDownText'

interface ChatEventReplyProps {
  memberName: string | undefined
  replyingToId: string
  replyingToText: string
  replyingToFile?: ChatEventFileRaw | null
  isDisplay: boolean
  styledFragments?: StyledFragments
  isActiveReply: boolean
  dismissReplyMsgMode?: () => void
  onTapReplyMessage?: () => void
}

interface ChatEventReplyMessageComponentProps {
  replyToId: string
}

export const ChatEventReplyMessageComponent = memo(
  ({ replyToId }: ChatEventReplyMessageComponentProps) => {
    const roomId = useSelector(getAppCurrentRoomId)

    const {
      replyMemberName,
      replyMessageText,
      replyMessageFile,
      replyMessageEvent,
      replyIsDisplay,
      replyStyledFragments,
    } = useGetReplyToOriginalMessage({ roomId, replyToId })

    const onTapReplyMessage = useScrollToReplyParent({
      replyMessageEvent: replyMessageEvent!,
    })

    return (
      <ChatEventReply
        memberName={replyMemberName}
        replyingToId={replyToId}
        replyingToText={replyMessageText}
        replyingToFile={replyMessageFile}
        isDisplay={!!replyIsDisplay}
        styledFragments={replyStyledFragments}
        isActiveReply={false}
        onTapReplyMessage={onTapReplyMessage}
      />
    )
  },
)

export const ChatEventReply = memo(
  ({
    memberName = '',
    replyingToId = '',
    replyingToText = '',
    replyingToFile = null,
    isDisplay = false,
    styledFragments = [],
    isActiveReply = true,
    dismissReplyMsgMode = () => {},
    onTapReplyMessage = () => {},
  }: ChatEventReplyProps) => {
    const strings = useStrings()
    const styles = getStyles()
    const { processedMessage = '' } = useGetProcessedMarkdownText(
      replyingToText,
      isDisplay,
    )
    const fileId = useFileId({
      driveId: replyingToFile?.key ?? '',
      path: replyingToFile?.path ?? '',
      version: replyingToFile?.version ?? 0,
    })
    const [file] = useFile(fileId)
    const preview = file?.previews.large ?? file?.previews.small ?? null
    const { isAudio, isImage, isVideo } = useMemo(
      () => getMediaType(file?.path!, file?.type),
      [file],
    )
    const isDocument = !!file && !isAudio && !isImage && !isVideo
    const previewIconComponent = useMemo(() => {
      let name = null
      if (isAudio) name = 'speakerHighFilled'
      if (isImage) name = 'cameraFilled'
      if (isVideo) name = 'videoFilled'
      if (isDocument) name = 'file'
      if (!name) return null
      return (
        <SvgIcon
          name={name as any}
          width={UI_SIZE_16}
          height={UI_SIZE_16}
          color={colors.keet_grey_200}
        />
      )
    }, [isAudio, isImage, isVideo, isDocument])

    const CancelIconComponent = useMemo(() => {
      return (
        <Pressable
          onPress={dismissReplyMsgMode}
          style={[styles.replyCancelIcon, s.alignSelfStart]}
        >
          <SvgIcon name={'close'} width={UI_SIZE_36} height={UI_SIZE_36} />
        </Pressable>
      )
    }, [dismissReplyMsgMode, styles.replyCancelIcon])

    return (
      <View
        style={[
          s.row,
          [styles.chatReply, isActiveReply && styles.chatReplyActive],
        ]}
      >
        <Pressable
          disabled={isActiveReply}
          onPress={onTapReplyMessage}
          style={[
            isActiveReply && s.container,
            s.centerAlignedRow,
            styles.replyText,
          ]}
        >
          {preview && (
            <Image
              style={styles.replyPreview}
              source={{ uri: preview }}
              contentFit="cover"
              recyclingKey={preview}
              cachePolicy="memory"
            />
          )}
          <View style={s.column}>
            {memberName.length > 0 && (
              <Text style={styles.chatReplyUserName}>
                {(isActiveReply ? strings.chat.replyingTo + ' ' : '') +
                  memberName}
              </Text>
            )}
            {file ? (
              <View style={s.centerAlignedRow}>
                {previewIconComponent}
                <Text style={styles.replyPreviewLabel}>
                  {isAudio
                    ? strings.chat.audio
                    : isImage
                      ? strings.chat.image
                      : isVideo
                        ? strings.chat.video
                        : strings.chat.file}
                </Text>
              </View>
            ) : isDisplay ? (
              <TextMessageDisplay
                messageId={replyingToId}
                text={replyingToText}
                textStyle={styles.chatReplyTextSmall}
                styledFragments={styledFragments}
                forPreview
              />
            ) : (
              <MarkdownPreview
                text={processedMessage}
                style={styles.chatReplyText}
                ellipsizeMode="tail"
                numberOfLines={3}
                isFocused={true}
              />
            )}
          </View>
        </Pressable>
        {isActiveReply && CancelIconComponent}
      </View>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const padding = theme.spacing.standard / 2

  const styles = StyleSheet.create({
    chatReply: {
      marginVertical: theme.spacing.normal,
    },
    chatReplyActive: {
      marginLeft: padding,
    },
    chatReplyText: {
      ...theme.text.reply,
    },
    chatReplyTextSmall: {
      fontSize: 12,
    },
    chatReplyUserName: {
      ...theme.text.replyBold,
      color: colors.blue_400,
    },
    replyCancelIcon: {
      paddingHorizontal: UI_SIZE_8,
    },
    replyPreview: {
      borderRadius: UI_SIZE_8,
      height: UI_SIZE_32,
      marginEnd: UI_SIZE_8,
      width: UI_SIZE_32,
    },
    replyPreviewLabel: {
      ...theme.text.body,
      color: colors.keet_grey_200,
      fontSize: UI_SIZE_14,
      marginStart: UI_SIZE_4,
    },
    replyText: {
      borderColor: theme.color.blue_600,
      borderLeftWidth: UI_SIZE_4,
      flexGrow: 1,
      paddingHorizontal: padding,
    },
  })

  return styles
})
