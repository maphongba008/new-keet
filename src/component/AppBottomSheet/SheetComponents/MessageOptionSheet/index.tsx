import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { StyleSheet, View } from 'react-native'

import { getFileId } from '@holepunchto/keet-store/store/media/file'

import { ProgressBar } from 'component/Progress'
import { createThemedStylesheet } from 'component/theme'
import { FileStatsBar } from 'screen/RoomScreen/ChatEvent/FileStatsBar'
import {
  DOWNLOAD_STATUS_DELAY_MS,
  downloadAndCopyImage,
  downloadAndShare,
  downloadDoc,
  downloadMedia,
  ensureMediaLibraryPermissions,
  FETCH_DELAY_MS,
} from 'lib/download'
import { consoleError } from 'lib/errors'
import { getMediaType } from 'lib/fs'
import { useDidMount } from 'lib/hooks/useDidMount'
import { showErrorNotifier } from 'lib/hud'
import { getMimeTypeAsync } from 'lib/KeetVideoUtilsModule'
import { ChatEventFileRaw } from 'lib/types'
import { wait } from 'lib/wait'

import { useStrings } from 'i18n/strings'

import { closeBottomSheet, showBottomSheet } from '../../AppBottomSheet.Store'
import BottomSheetEnum from '../BottomSheetEnum'

export enum ActionType {
  DOWNLOAD,
  COPY_IMAGE,
  SHARE,
}

export interface MessageOptionsSheetInterface {
  file: ChatEventFileRaw
  opts: {
    src: string
  }
  action: ActionType
  close?: () => void
}

const MessageOptionsSheet = ({
  file,
  opts: { src },
  action,
  close = closeBottomSheet,
}: MessageOptionsSheetInterface) => {
  const fileId = getFileId({
    driveId: file.key,
    path: file.path,
    version: file.version,
  })
  const strings = useStrings()
  const styles = getStyles()
  const [fileType, setFileType] = useState(
    file.type || 'application/octet-stream',
  )
  const [progress, setProgress] = useState(-1)
  const cancelRef = useRef<() => void>()

  useDidMount(async () => {
    const mimeType = await getMimeTypeAsync(src)

    if (mimeType) setFileType(mimeType)
  })

  const onCancel = useCallback(() => {
    cancelRef.current?.()
    cancelRef.current = undefined
    close()
  }, [close])

  const onClose = useCallback(() => {
    cancelRef.current = undefined
    close()
  }, [close])

  useEffect(() => {
    return () => {
      cancelRef.current?.()
    }
  }, [])

  useEffect(() => {
    if (progress === 1) {
      const timer = setTimeout(() => onClose(), DOWNLOAD_STATUS_DELAY_MS)
      return () => clearTimeout(timer)
    }
  }, [progress, onClose])

  const { isImage, isVideo, isAudio, isSupportedFileType, isSVG } = useMemo(
    () => getMediaType(src, fileType),
    [src, fileType],
  )

  const [progressTitle, progressTitleDone] = (() => {
    switch (action) {
      case ActionType.DOWNLOAD: {
        if (isSVG) {
          return [strings.downloads.savingDoc, strings.downloads.docSaved]
        }
        if (isImage) {
          return [strings.downloads.savingImage, strings.downloads.imageSaved]
        }
        if (isVideo) {
          return [strings.downloads.savingVideo, strings.downloads.videoSaved]
        }
        if (isAudio) {
          return [strings.downloads.savingAudio, strings.downloads.audioSaved]
        }
        return [strings.downloads.savingDoc, strings.downloads.docSaved]
      }
      case ActionType.COPY_IMAGE: {
        return isSVG
          ? [strings.downloads.savingDoc, strings.downloads.docSaved]
          : [strings.downloads.preparingImage, strings.common.done]
      }
      case ActionType.SHARE: {
        const _progressTitle = isSVG
          ? strings.downloads.preparingDoc
          : isImage
            ? strings.downloads.preparingImage
            : isVideo
              ? strings.downloads.preparingVideo
              : isAudio
                ? strings.downloads.preparingAudio
                : strings.downloads.preparingDoc
        return [_progressTitle, strings.common.done]
      }
    }
  })()

  useEffect(() => {
    const handleDownload = async () => {
      const isMedia = isSupportedFileType && ((isImage && !isSVG) || isVideo)
      // make sure we have permissions to save to media library
      if (isMedia) {
        const granted = await ensureMediaLibraryPermissions()
        if (!granted) {
          await wait(FETCH_DELAY_MS)
          close()
          await wait(FETCH_DELAY_MS)
          showBottomSheet({
            bottomSheetType: BottomSheetEnum.PermissionRequired,
            title: strings.common.imgPermissionRequired,
            close: () => closeBottomSheet(),
          })
          return
        }
      }

      try {
        setProgress(0)
        // currently not support audio yet
        const downloadFunc = isMedia ? downloadMedia : downloadDoc
        const { fetch, cancel } = downloadFunc(
          {
            uri: src!,
            type: isSVG ? 'application/octet-stream' : fileType,
          },
          setProgress,
        )
        cancelRef.current = cancel
        await wait(FETCH_DELAY_MS)
        await fetch()
      } catch (e: any) {
        close()
        showErrorNotifier(e.message)
        consoleError(e)
      }
    }

    const handleCopyImage = async () => {
      if (isSVG) {
        const { fetch, cancel } = downloadDoc(
          { uri: src!, type: isSVG ? 'application/octet-stream' : fileType },
          setProgress,
        )
        cancelRef.current = cancel
        const timer = setTimeout(fetch, FETCH_DELAY_MS)
        return () => clearTimeout(timer)
      }

      setProgress(0)
      const { fetch, cancel } = downloadAndCopyImage(
        { uri: src!, type: fileType },
        setProgress,
      )
      cancelRef.current = cancel
      const timer = setTimeout(fetch, FETCH_DELAY_MS)
      return () => clearTimeout(timer)
    }

    const handleShare = async () => {
      const { fetch, cancel } = downloadAndShare(
        { uri: src!, type: fileType },
        setProgress,
      )
      setProgress(0)
      cancelRef.current = cancel
      const timer = setTimeout(() => {
        fetch().then((res) => {
          if (res === undefined) {
            return
          }
          close()
        })
      }, FETCH_DELAY_MS)
      return () => clearTimeout(timer)
    }

    const takeAction = () => {
      switch (action) {
        case ActionType.DOWNLOAD: {
          handleDownload()
          break
        }
        case ActionType.COPY_IMAGE: {
          handleCopyImage()
          break
        }
        case ActionType.SHARE: {
          handleShare()
          break
        }
      }
    }
    takeAction()
  }, [
    action,
    close,
    file,
    fileType,
    isAudio,
    isImage,
    isSVG,
    isSupportedFileType,
    isVideo,
    src,
    strings.common.imgPermissionRequired,
    strings.downloads.permissionError,
  ])

  return (
    <>
      <View style={styles.progressRoot}>
        <ProgressBar
          progress={progress}
          title={progressTitle}
          titleDone={progressTitleDone}
          onCancel={onCancel}
          onClose={onClose}
        >
          <FileStatsBar fileId={fileId} />
        </ProgressBar>
      </View>
    </>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    progressRoot: {
      marginBottom: theme.spacing.standard,
    },
  })
  return styles
})

export default memo(MessageOptionsSheet)
