import React, { memo, ReactNode, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { doPreview } from 'screen/MediaPreviewScreen'
import s from 'lib/commonStyles'
import { useFile } from 'lib/hooks/useFile'

import {
  ChatEventFileImage,
  ChatEventFileMediaProps,
  ImageLoadStatus,
} from './ChatEventFileImage'
import { useChatEventFileContext } from './context/ChatEventFileContext'
import { CHAT_EVENT_FILE_GROUP_ID } from '../Chat.hooks'

interface ChatEventFileVideoProps extends ChatEventFileMediaProps {}

export const ChatEventFileVideo = memo((props: ChatEventFileVideoProps) => {
  const { path: name, id: fileId, dimensions } = useChatEventFileContext()
  const [fileEntry] = useFile(fileId)
  const { httpLink: uri, previews } = fileEntry || {}
  const previewUri = previews?.large || undefined
  const styles = getStyles()
  const onVideo = useCallback(() => {
    if (uri) {
      doPreview({
        id: fileId,
        name,
        uri,
        previewUri,
        mediaType: 'video',
        groupId: CHAT_EVENT_FILE_GROUP_ID,
        aspectRatio: dimensions
          ? dimensions.height / dimensions.width
          : undefined,
      })
    }
  }, [dimensions, fileId, name, previewUri, uri])

  return (
    <ChatEventFileImage
      {...props}
      placeholderIcon="video"
      onSelect={onVideo}
      testID="ChatEventFileVideo"
    >
      {(cachedImage: ReactNode, loadingStatus, imageDimensions) => {
        return (
          <View style={s.posRelative}>
            {cachedImage}
            {loadingStatus === ImageLoadStatus.mount && (
              <View style={[styles.fileIconWrapper, imageDimensions]}>
                <SvgIcon name="play" style={styles.fileIconOverImage} />
              </View>
            )}
          </View>
        )
      }}
    </ChatEventFileImage>
  )
})

ChatEventFileVideo.displayName = 'ChatEventFileVideo'

export default ChatEventFileVideo

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
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
  })
  return styles
})
