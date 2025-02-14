import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { createThemedStylesheet } from 'component/theme'
import { useFileId } from 'screen/RoomScreen/hooks/useFileId'
import { UI_SIZE_4, UI_SIZE_8 } from 'lib/commonStyles'
import { scaleImageWithinLimits } from 'lib/previewLink'
import { DisplayFormat } from 'lib/types'

import { ChatEventFile } from '../ChatEventFile'
import {
  ChatEventFileContext,
  ChatEventFileContextValue,
} from '../context/ChatEventFileContext'

export const ChatEventLinkPreviewMessage = ({
  event,
  fromLocal,
}: {
  event: DisplayFormat['preview']
  fromLocal: boolean
}) => {
  const fileProp = event.file
  const { title, description, file } = event
  const { width = 0, height = 0 } = fileProp?.dimensions || {}
  const styles = getStyles()

  const maxWidth = 300
  const scaledDimension = scaleImageWithinLimits(width, height, maxWidth)

  const componentWidthStyle = useMemo(() => {
    return file
      ? { width: scaledDimension.width + UI_SIZE_8 }
      : styles.fullWidth
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, scaledDimension])

  const fileId = useFileId({
    driveId: fileProp?.driveId || '',
    path: fileProp?.path || '',
    version: fileProp?.version || 0,
  })

  const fileDetails = useMemo((): ChatEventFileContextValue => {
    return {
      ...fileProp,
      dimensions: { ...scaledDimension },
      key: fileProp?.driveId,
      id: fileId,
    }
  }, [fileId, fileProp, scaledDimension])

  if (!(title && description) && !file) {
    return null
  }

  const shouldDisplayPreviewText =
    (!!title && !!description) || ((!!title || !!description) && !!file)

  return (
    <ChatEventFileContext.Provider value={fileDetails}>
      <View
        style={[
          styles.previewContainer,
          fromLocal && styles.sentPreview,
          componentWidthStyle,
        ]}
      >
        {shouldDisplayPreviewText && !!title && (
          <Text style={styles.previewTitle} numberOfLines={1}>
            {title}
          </Text>
        )}
        {shouldDisplayPreviewText && !!description && (
          <Text style={styles.previewDescription} numberOfLines={2}>
            {description}
          </Text>
        )}
        {!!file && (
          <View style={styles.previewImageContainer}>
            <ChatEventFile />
          </View>
        )}
      </View>
    </ChatEventFileContext.Provider>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    fullWidth: {
      width: '100%',
    },
    previewContainer: {
      alignSelf: 'flex-start',
      backgroundColor: theme.color.grey_900,
      borderRadius: theme.border.radiusNormal,
      gap: UI_SIZE_4,
      marginVertical: theme.spacing.normal,
      padding: theme.spacing.normal,
    },
    previewDescription: {
      ...theme.text.body,
      color: theme.color.grey_100,
      fontSize: 11,
    },
    previewImageContainer: {
      marginTop: UI_SIZE_4,
    },
    previewTitle: {
      ...theme.text.bodyBold,
      fontSize: 11,
    },
    sentPreview: {
      backgroundColor: theme.color.midnight_blue,
    },
  })
  return styles
})
