import React, { useEffect, useMemo, useRef } from 'react'
import { Image, View } from 'react-native'
import { create } from 'zustand'
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet'
import _debounce from 'lodash/debounce'

import { BACK_DEBOUNCE_DELAY, BACK_DEBOUNCE_OPTIONS } from 'lib/constants'
import { waitOnKeyboardDidDismiss } from 'lib/keyboard'
import { parseURLToGetKey } from 'lib/media'
import { navigate, SCREEN_MEDIA_PREVIEW } from 'lib/navigation'

import { MediaPreviewEntry, MediaPreviewType } from './MediaPreview.Types'

interface MediaPreviewState {
  fileEntries: MediaPreviewEntry[]
  clearFileEntries: () => void
  addFileEntry: (entry: MediaPreviewEntry) => void
  updateFileEntry: (
    entry: Pick<MediaPreviewEntry, 'uri'> & Partial<MediaPreviewEntry>,
  ) => void
  removeFileEntry: (params: { uri: string } | { groupId: string }) => void
}

const mediaViewRefs: { [key: string]: React.MutableRefObject<View> } = {}
export const getMediaViewRef = (
  groupId: string,
  uri: string,
): View | undefined =>
  mediaViewRefs[getMediaPreviewRefKey(groupId, uri)]?.current

export const useMediaPreviewStore = create<MediaPreviewState>((_set, _get) => ({
  fileEntries: [],
  addFileEntry: (newFileEntry) =>
    _set(({ fileEntries }) => {
      return {
        fileEntries: [
          ...fileEntries.filter(
            (fileEntry) =>
              !(
                fileEntry.uri === newFileEntry.uri &&
                fileEntry.groupId === newFileEntry.groupId
              ),
          ),
          newFileEntry,
        ].sort((a, b) => (a.index || 0) - (b.index || 0)),
      }
    }),
  updateFileEntry: (newFileEntry) =>
    _set(({ fileEntries }) => {
      return {
        fileEntries: fileEntries
          .map((fileEntry) => {
            if (
              fileEntry.uri === newFileEntry.uri &&
              (newFileEntry.groupId
                ? fileEntry.groupId === newFileEntry.groupId
                : true)
            ) {
              return { ...fileEntry, ...newFileEntry }
            }

            return fileEntry
          })
          .sort((a, b) => (a.index || 0) - (b.index || 0)),
      }
    }),
  removeFileEntry: (params) =>
    _set(({ fileEntries }) => ({
      fileEntries: fileEntries.filter((fileEntry) =>
        'uri' in params
          ? fileEntry.uri !== params.uri
          : fileEntry.groupId !== params.groupId,
      ),
    })),
  clearFileEntries: () => _set(() => ({ fileEntries: [] })),
}))

export const useMediaPreviewFileEntries = () =>
  useMediaPreviewStore((state) => state.fileEntries)

export const useMediaPreviewFileEntry = (uri: string, groupId: string) =>
  useMediaPreviewStore((state) =>
    state.fileEntries.find((value) =>
      Boolean(value.groupId === groupId && value.uri === uri),
    ),
  )

export const addMediaPreviewFileEntry: MediaPreviewState['addFileEntry'] = (
  ...params
) => useMediaPreviewStore.getState().addFileEntry(...params)

export const removeMediaPreviewFileEntry: MediaPreviewState['removeFileEntry'] =
  (...params) => useMediaPreviewStore.getState().removeFileEntry(...params)

export const clearMediaPreviewFileEntries: MediaPreviewState['clearFileEntries'] =
  () => useMediaPreviewStore.getState().clearFileEntries()

export const updateMediaPreviewFileEntry: MediaPreviewState['updateFileEntry'] =
  (...params) => useMediaPreviewStore.getState().updateFileEntry(...params)

export const getMediaPreviewFileEntries =
  (): MediaPreviewState['fileEntries'] =>
    useMediaPreviewStore.getState().fileEntries

export const getMediaPreviewFileEntry = (
  uri: string,
  groupId: string,
): MediaPreviewEntry | undefined =>
  useMediaPreviewStore
    .getState()
    .fileEntries.find((entry) => entry.uri === uri && entry.groupId === groupId)

export const getMediaPreviewRefKey = (groupId: string, uri: string) => {
  return `${groupId}-${parseURLToGetKey(uri)}`
}

export function useMediaPreviewSource(
  entry: MediaPreviewEntry,
  isMedia: boolean,
): React.MutableRefObject<View> {
  const currentMediaPreviewRef = useRef<View>() as React.MutableRefObject<View>
  const eventId = useMemo(
    () => getMediaPreviewRefKey(entry.groupId, entry.uri),
    [entry.groupId, entry.uri],
  )

  useEffect(() => {
    if (!entry.uri || !isMedia || entry.index === null) return

    mediaViewRefs[eventId] = currentMediaPreviewRef
    addMediaPreviewFileEntry(entry)

    return () => {
      removeMediaPreviewFileEntry({ uri: entry.uri })
      delete mediaViewRefs[eventId]
    }
  }, [isMedia, entry, eventId])

  return currentMediaPreviewRef
}

export const parsePosition = (
  isTop: boolean,
  _x: number,
  _y: number,
  width: number,
  height: number,
) => {
  let x = _x
  let y = Math.max(_y, -height)
  if (_x + _y === 0) {
    x = (WINDOW_WIDTH - width) / 2
    y = isTop ? -height : WINDOW_HEIGHT
  }

  return { x, y, width, height }
}

export const getAspectRatioAsync = (uri: string) =>
  new Promise<number>((resolve, reject) => {
    return Image.getSize(
      uri,
      (width, height) => {
        resolve(height / width)
      },
      reject,
    )
  })

export const doPreview = _debounce(
  async (data: Omit<MediaPreviewType, 'position'>) => {
    const viewRef = getMediaViewRef(data.groupId, data.uri)
    const fileEntry = getMediaPreviewFileEntry(data.uri, data.groupId)

    await waitOnKeyboardDidDismiss()
    let aspectRatio = 0
    if (data.aspectRatio) {
      aspectRatio = data.aspectRatio
    } else if (fileEntry?.aspectRatio) {
      aspectRatio = fileEntry?.aspectRatio
    } else if (data.mediaType.startsWith('image')) {
      aspectRatio = await getAspectRatioAsync(data.uri)
    }

    viewRef?.measureInWindow((...params) => {
      navigate(SCREEN_MEDIA_PREVIEW, {
        ...data,
        position: parsePosition(true, ...params),
        groupId: data.groupId,
        aspectRatio,
      })
    })
  },
  BACK_DEBOUNCE_DELAY,
  BACK_DEBOUNCE_OPTIONS,
)
