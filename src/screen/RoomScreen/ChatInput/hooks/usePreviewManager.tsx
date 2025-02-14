import { useCallback, useEffect, useRef } from 'react'

import { getFileName, getPathFromUri } from 'lib/fs'
import { LinkPreviewFilesType } from 'lib/media'
import { getAbsolutePath, getFileInfo, prefetchImage } from 'lib/previewLink'
import {
  decrementPendingUploadsAmount,
  getUploadByRoomId,
  LinkPreviewObjectType,
  removeFileFromState,
  setPendingUploadsAmount,
  updateFileState,
  UploadFile,
  uploadFileToState,
} from 'lib/uploads'

export const usePreviewManager = (text: string) => {
  const inputTextRef = useRef(text)

  useEffect(() => {
    inputTextRef.current = text // Keep the ref updated with the latest state value
  }, [text])

  const processFile = useCallback(
    async (
      url: string,
      id: string,
      roomId: string,
      filenames: LinkPreviewFilesType,
      previewData: LinkPreviewObjectType,
    ) => {
      if (inputTextRef.current.length > 0) {
        const file: UploadFile = {
          id,
          path: url,
          byteLength: 0,
          type: '',
          isDownloading: true,
          isLinkPreview: true,
        }

        uploadFileToState(roomId, file, id)
        try {
          const imageUrl = getAbsolutePath(url, filenames[url])

          if (imageUrl) {
            const localUrl = await prefetchImage(imageUrl)
            const { type, byteLength, dimensions, name } = await getFileInfo(
              localUrl,
              url,
            )
            if (dimensions?.width && dimensions?.height) {
              updateFileState(id, {
                path: getPathFromUri(localUrl),
                byteLength,
                type,
                name,
                dimensions,
                previewData: previewData[id],
              })
            } else {
              updateFileState(id, {
                previewData: previewData[id],
              })
            }
          } else {
            updateFileState(id, {
              previewData: previewData[id],
            })
          }
        } catch (error) {
          removeFileFromState(roomId, id)
        }
      } else {
        removeFileFromState(roomId, id)
      }
    },
    [],
  )

  const setPreviewFiles = useCallback(
    async (
      urls: string[],
      roomId: string,
      filenames: LinkPreviewFilesType = {},
      previewData: LinkPreviewObjectType = {},
    ) => {
      setPendingUploadsAmount(urls.length)

      for (const url of urls) {
        const hasFilenames = Object.keys(filenames).length > 0
        const id = hasFilenames ? url : getFileName(url) || `${Date.now()}`
        const roomUploadIds = getUploadByRoomId(roomId)

        if (roomUploadIds.includes(id)) {
          decrementPendingUploadsAmount()
          continue
        }

        await processFile(url, id, roomId, filenames, previewData)
      }
    },
    [processFile],
  )

  return { setPreviewFiles }
}
