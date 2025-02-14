import React, { memo, useCallback, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AudioPlayer from 'component/AudioPlayer'
import { ButtonBase } from 'component/Button'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_16 } from 'lib/commonStyles'
import { getIsVoiceNote } from 'lib/fs'
import { useFile } from 'lib/hooks/useFile'
import { getMessageCellAvailableWidth } from 'lib/size'

import { ChatEventFileAudioPlaceholder } from './ChatEventFileAudioPlaceholder'
import { ChatEventFileMeta } from './ChatEventFileMeta'
import { useChatEventContext } from './context/ChatEventContext'
import { useChatEventFileContext } from './context/ChatEventFileContext'
import { FileStatsBar } from './FileStatsBar'
import { useChatEvent } from './hooks/useChatEvent'

interface ChatEventFileAudioProps {
  onToggleClear: () => void
  onLongPress?: () => void
}

export const ChatEventFileAudio = memo(
  ({ onLongPress, onToggleClear }: ChatEventFileAudioProps) => {
    const { messageId } = useChatEventContext()
    const { path: name, id: fileId } = useChatEventFileContext()
    const [fileEntry, { isLoading: loading }] = useFile(fileId)
    const { httpLink: src, cleared, byteLength = 0 } = fileEntry || {}
    const styles = getStyles()
    const [loadingSrc, setLoadingSrc] = useState(!fileEntry)
    const lastSrc = useRef(src)

    const event = useChatEvent(messageId)
    const { file } = event

    // Recycling
    if (src !== lastSrc.current) {
      lastSrc.current = src
      setLoadingSrc(!cleared)
    }

    const onAudioLoaded = useCallback(() => {
      setLoadingSrc(false)
    }, [])

    const isMounting = !cleared && src
    const isReady = !loadingSrc
    const isPlaceholder = !isReady || cleared

    const isVoiceNote = getIsVoiceNote(file?.type, name)

    return (
      <View style={styles.audioPlayer} testID="ChatEventFileAudio">
        {isMounting && (
          <ButtonBase
            onLongPress={onLongPress}
            style={
              isPlaceholder && [StyleSheet.absoluteFill, styles.placeholder]
            }
          >
            {!isVoiceNote && <ChatEventFileMeta name={name} />}
            <AudioPlayer
              uri={src}
              onAudioLoaded={onAudioLoaded}
              fromChat
              samples={(isVoiceNote && fileEntry?.previews.audio) || []}
            />
          </ButtonBase>
        )}
        {isPlaceholder && (
          <ChatEventFileAudioPlaceholder
            name={name}
            byteLength={byteLength}
            loading={(loading || loadingSrc) && !cleared}
            onClick={onToggleClear}
          />
        )}
        {!isVoiceNote && <FileStatsBar fileId={fileId} />}
      </View>
    )
  },
)

ChatEventFileAudio.displayName = 'ChatEventFileAudio'

export default ChatEventFileAudio

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    audioPlayer: {
      ...s.justifyCenter,
      width: getMessageCellAvailableWidth() - UI_SIZE_16,
    },
    placeholder: {
      opacity: 0,
    },
  })
  return styles
})
