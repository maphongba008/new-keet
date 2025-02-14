import { memo, useCallback, useMemo, useState } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { Image } from 'expo-image'
import isEqual from 'react-fast-compare'

import { RoomFileRaw } from '@holepunchto/keet-store/store/room'

import { Loading } from 'component/Loading'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, useTheme } from 'component/theme'
import {
  doPreview,
  MediaFileMimeType,
  useMediaPreviewSource,
} from 'screen/MediaPreviewScreen'
import { useFileId } from 'screen/RoomScreen/hooks/useFileId'
import s, { UI_SIZE_12, UI_SIZE_20, UI_SIZE_32 } from 'lib/commonStyles'
import { getFileName, getMediaTypeFromExtension } from 'lib/fs'
import { DataAsyncStatus } from 'lib/hooks'
import { useFile } from 'lib/hooks/useFile'

import { RoomFileTileVideoBar } from './RoomFileTileVideoBar'

export const ROOM_FILE_TILE_SIZE =
  (Dimensions.get('window').width - UI_SIZE_32 - UI_SIZE_12) / 4

export const ROOM_FILE_TILE_GROUP_ID = 'ROOM_FILE_TILE'

interface RoomFileTileProps extends RoomFileRaw {
  index: number
}

export const RoomFileTile = memo(
  ({ driveId, path, version, index, mimeType }: RoomFileTileProps) => {
    const fileId = useFileId({ path, driveId, version })
    const [fileEntry] = useFile(fileId)
    const { httpLink: uri } = fileEntry || {}

    const [loadedStatus, setLoadedStatus] = useState(DataAsyncStatus.isLoading)
    const { isVideo, isImage } = getMediaTypeFromExtension(path)

    const setRefs = useMediaPreviewSource(
      {
        uri: uri || '',
        mediaType: mimeType as MediaFileMimeType,
        groupId: ROOM_FILE_TILE_GROUP_ID,
        index,
        id: fileId,
      },
      true,
    )

    const imageBase64 = useMemo(() => {
      let preview = null
      if (fileEntry?.previews)
        preview = fileEntry.previews.small || fileEntry.previews.large
      if (!preview) preview = uri
      if (!preview || preview?.startsWith('data:')) return preview

      return { uri: preview }
    }, [fileEntry, uri])

    const isImageAvailable = Boolean(imageBase64)
    const isImageLoading =
      !fileEntry || loadedStatus === DataAsyncStatus.isLoading

    const isImageError = loadedStatus === DataAsyncStatus.isError

    const styles = getStyles()
    const theme = useTheme()

    const onLoadError = useCallback(() => {
      setLoadedStatus(DataAsyncStatus.isError)
    }, [])
    const onLoad = useCallback(() => {
      setLoadedStatus(DataAsyncStatus.isReady)
    }, [])

    const onPress = useCallback(() => {
      if (uri && loadedStatus === DataAsyncStatus.isError) {
        setLoadedStatus(DataAsyncStatus.isLoading)
        return
      }
      if (loadedStatus === DataAsyncStatus.isError) {
        return
      }

      if (!uri) {
        return
      }

      if (isImage || isVideo) {
        doPreview({
          id: fileId,
          name: getFileName(path),
          uri,
          groupId: ROOM_FILE_TILE_GROUP_ID,
          mediaType: isImage ? 'image' : 'video',
        })
      }
    }, [uri, loadedStatus, isImage, isVideo, fileId, path])
    const videoDuration = fileEntry?.duration

    return (
      <Pressable style={styles.container} onPress={onPress}>
        <View ref={setRefs} collapsable={false} style={s.fullHeight}>
          {isImageAvailable && (
            <Image
              style={s.container}
              source={imageBase64}
              alt={path}
              contentFit="cover"
              onLoad={onLoad}
              onError={onLoadError}
              recyclingKey={path}
              cachePolicy="memory-disk"
            />
          )}
        </View>
        <View style={styles.loaderContainer}>
          {isImageLoading && <Loading style={styles.loader} />}
          {isImageError && (
            <SvgIcon
              name="warning"
              color={theme.color.attention}
              width={UI_SIZE_20}
              height={UI_SIZE_20}
            />
          )}
        </View>

        {typeof videoDuration === 'number' && (
          <RoomFileTileVideoBar videoDuration={videoDuration} />
        )}
      </Pressable>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.color.grey_600,
      borderRadius: UI_SIZE_12,
      flex: 0.25,
      height: ROOM_FILE_TILE_SIZE,
      overflow: 'hidden',
    },
    loader: {
      height: UI_SIZE_20,
      width: UI_SIZE_20,
    },
    loaderContainer: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
  return styles
})
