import { NativeModule } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import * as FileSystem from 'expo-file-system'
import * as MediaLibrary from 'expo-media-library'
import {
  EventSubscription,
  LegacyEventEmitter,
  requireNativeModule,
} from 'expo-modules-core'
import Share from 'react-native-share'
import _replace from 'lodash/replace'

import { waitForAnimations } from 'component/theme'
import { consoleError } from 'lib/errors'

import { BOTTOM_SHEET_ANIMATION_DURATION } from './constants'
import { getMediaType } from './fs'
import { isAndroid, isIOS } from './platform'
import { deleteAppGroupFile } from './shareContent'
import { UploadFile } from './uploads'

export const FETCH_DELAY_MS = 500
export const DOWNLOAD_STATUS_DELAY_MS = FETCH_DELAY_MS * 2
export const DOWNLOAD_CLOSE_DELAY_MS =
  BOTTOM_SHEET_ANIMATION_DURATION + DOWNLOAD_STATUS_DELAY_MS

const PROGRESS_INTERVAL = 1 / 100 // 1%

interface DownloadStatus {
  PENDING: number
  RUNNING: number
  PAUSED: number
  SUCCESSFUL: number
  STATUS_FAILED: number
}

interface DownloadProgressEvent {
  status: number
  progress: number
  downloadId: number
}
interface KeetDownloadsModuleOutput extends NativeModule {
  download: (uri: string) => Promise<number | null>
  openDownload: (downloadId: number) => Promise<boolean>
  cancelDownload: (downloadId: number) => Promise<boolean>
  addAssetAndroid: (uri: string, video: boolean) => Promise<boolean>
  downloadsRelativePath: string
  downloadsDir: string
  DOWNLOAD_STATUS: DownloadStatus
  DOWNLOAD_PROGRESS_LISTENER_KEY: string
}

const KeetDownloadsModule: KeetDownloadsModuleOutput = isAndroid
  ? requireNativeModule('KeetDownloadsModule')
  : {
      async download() {
        return null
      },
      async cancelDownload() {
        return false
      },
      async addAssetAndroid() {
        return false
      },
      async openDownload() {
        return false
      },
      addListener() {},
      removeListeners() {},
      downloadsRelativePath: '',
      downloadsDir: '',
      DOWNLOAD_STATUS: {
        PENDING: 1,
        RUNNING: 2,
        PAUSED: 4,
        SUCCESSFUL: 8,
        STATUS_FAILED: 16,
      },
      DOWNLOAD_PROGRESS_LISTENER_KEY: 'DOWNLOAD_PROGRESS_LISTENER_KEY',
    }

// Expo sdk 52- EventEmitter does not work in local module https://github.com/expo/expo/issues/32795#issuecomment-2469930832
const KeetDownloadsModuleEmitter = new LegacyEventEmitter(KeetDownloadsModule)

export const DOWNLOAD_STATUS = KeetDownloadsModule.DOWNLOAD_STATUS

export const openFileAndroid = KeetDownloadsModule.openDownload

export function addDownloadProgressListener(
  listener: (event: DownloadProgressEvent) => void,
): EventSubscription {
  return KeetDownloadsModuleEmitter.addListener(
    KeetDownloadsModule.DOWNLOAD_PROGRESS_LISTENER_KEY,
    listener,
  )
}

export const getFilenameFromUri = (uri: string) => {
  // File name with whitespace || URL-encoded chars will throws Error: no such file or directory
  return `${FileSystem.cacheDirectory}${_replace(
    uri.slice(uri.lastIndexOf('/') + 1),
    /%[0-9A-Fa-f]{2}|\s/g,
    '',
  )}`
}

interface DownloadAttachmentData {
  uri: string
  type: string
}

interface DownloadFetch {
  fetch: () => Promise<string | undefined>
  cancel: () => Promise<void>
}

export const downloadAttachmentAndroid: typeof downloadAttachment = (
  attachment,
  onProgress,
) => {
  const { uri } = attachment

  let downloadId: number | undefined | null

  const fetch = async () => {
    try {
      downloadId = await KeetDownloadsModule.download(uri)

      if (!downloadId) return

      const listener = addDownloadProgressListener((event) => {
        if (downloadId === event.downloadId) {
          const nextProgress = event.progress / 100
          onProgress(nextProgress)
        }
        if (event.status === KeetDownloadsModule.DOWNLOAD_STATUS.SUCCESSFUL) {
          // eslint-disable-next-line clean-timer/assign-timer-id
          setTimeout(() => {
            listener.remove()
          }, DOWNLOAD_CLOSE_DELAY_MS)
        }
      })
    } catch (err) {
      consoleError(err)
    }
    return undefined
  }

  const cancel = async () => {
    try {
      if (typeof downloadId === 'number') {
        await KeetDownloadsModule.cancelDownload(downloadId)
      }
    } catch (err) {
      consoleError(err)
    }
  }

  return { fetch, cancel }
}

export const downloadAttachment = (
  attachment: DownloadAttachmentData,
  onProgress: (progress: number) => void,
): DownloadFetch => {
  const { uri } = attachment
  let lastProgress = 0
  const resumable = FileSystem.createDownloadResumable(
    uri,
    getFilenameFromUri(uri),
    undefined,
    ({ totalBytesWritten, totalBytesExpectedToWrite }) => {
      const progress = totalBytesWritten / totalBytesExpectedToWrite
      // Prevent the callback from being called too frequently
      if (progress === 1 || progress - lastProgress > PROGRESS_INTERVAL) {
        onProgress(progress)
        lastProgress = progress
      }
    },
  )

  const fetch = async () => {
    try {
      const res = await resumable.downloadAsync()
      return res?.uri
    } catch (err) {
      consoleError(err)
    }
    return undefined
  }

  const cancel = async () => {
    try {
      await resumable.cancelAsync()
    } catch (err) {
      consoleError(err)
    }
  }

  return { fetch, cancel }
}

export const downloadDoc = (
  doc: DownloadAttachmentData,
  onProgress: (progress: number) => void,
): DownloadFetch => {
  const { type = '' } = doc || {}
  const { isImage, isVideo, isSVG, isSupportedFileType } = getMediaType(
    doc.uri,
    type,
  )
  if (isSupportedFileType && (isImage || isVideo) && !isSVG) {
    throw new Error('Wrong attachment kind')
  }

  if (isAndroid) {
    try {
      const result = downloadAttachmentAndroid(doc, onProgress)
      return result
    } catch (error) {
      consoleError(error)
    }
  }

  const download = downloadAttachment(doc, onProgress)

  const fetchDoc = async () => {
    try {
      const downloadUri = await download.fetch()

      if (isIOS) {
        if (downloadUri === undefined) {
          // TODO: say something
          return undefined
        }

        await waitForAnimations()
        await Share.open({
          url: downloadUri,
          saveToFiles: true,
          failOnCancel: false,
        }).catch(() => {
          /** Always throws on cancel, ignore until fixed */
        })
        await FileSystem.deleteAsync(downloadUri, { idempotent: true })
      }
    } catch (error) {
      consoleError(error)
    }
    return undefined
  }

  return { fetch: fetchDoc, cancel: download.cancel }
}

const ALBUM_TITLE = 'Keet'

export const ensureMediaLibraryPermissions = async () => {
  let req = await MediaLibrary.getPermissionsAsync()
  if (!req.granted) {
    req = await MediaLibrary.requestPermissionsAsync()
  }
  return req.granted
}

const addAsset = async (uri: string, video: boolean) => {
  const granted = await ensureMediaLibraryPermissions()
  if (!granted) {
    throw new Error('No MediaLibrary permissions')
  }

  if (!isAndroid || !(await KeetDownloadsModule.addAssetAndroid(uri, video))) {
    const asset = await MediaLibrary.createAssetAsync(uri)
    const permission = await MediaLibrary.getPermissionsAsync()

    if (permission.accessPrivileges === 'all') {
      let album = await MediaLibrary.getAlbumAsync(ALBUM_TITLE)
      if (album === null) {
        album = await MediaLibrary.createAlbumAsync(ALBUM_TITLE, asset, false)
      } else {
        await MediaLibrary.addAssetsToAlbumAsync(asset, album, false)
      }
    }
  }
}

export const normalizeUri = (downloadUri: string = '') =>
  downloadUri.includes('?')
    ? downloadUri.substring(0, downloadUri.indexOf('?'))
    : downloadUri

export const downloadMedia: typeof downloadAttachment = (media, progress) => {
  const { type = '' } = media || {}

  const { isImage, isVideo } = getMediaType(media.uri, type)
  if (!isImage && !isVideo) {
    throw new Error('Wrong attachment kind')
  }

  const download = downloadAttachment(media, progress)

  const fetchMedia = async () => {
    const downloadUri = await download.fetch()

    if (downloadUri === undefined) {
      return undefined
    }

    try {
      // Normalize the URI to remove query parameters
      const normalizedUri = normalizeUri(downloadUri)
      await addAsset(normalizedUri, !!isVideo)

      await FileSystem.deleteAsync(normalizedUri, { idempotent: true })
      return downloadUri
    } catch (err) {
      consoleError(err)
      throw err
    }
  }

  return { fetch: fetchMedia, cancel: download.cancel }
}

export const downloadAndCopyImage: typeof downloadAttachment = (
  image,
  progress,
) => {
  const { type = '' } = image || {}
  const { isImage } = getMediaType(image.uri, type)
  if (!isImage) {
    throw new Error('Wrong attachment kind')
  }

  const download = downloadAttachment(image, progress)

  const fetchImage = async () => {
    const downloadUri = await download.fetch()

    if (downloadUri === undefined) {
      // TODO: say something
      return undefined
    }

    try {
      const base64 = await FileSystem.readAsStringAsync(downloadUri, {
        encoding: 'base64',
      })
      await Clipboard.setImageAsync(base64)
      await FileSystem.deleteAsync(downloadUri, { idempotent: true })
      return downloadUri
    } catch (err) {
      consoleError(err)
    }
    return undefined
  }

  return { fetch: fetchImage, cancel: download.cancel }
}

export const downloadAndShare: typeof downloadAttachment = (
  attachment,
  progress,
  skipShare = false,
) => {
  const download = downloadAttachment(attachment, progress)

  const fetchAttachment = async () => {
    const downloadUri = await download.fetch()

    if (downloadUri === undefined) {
      // TODO: say something
      return undefined
    }

    try {
      await waitForAnimations()
      if (!skipShare) {
        await Share.open({
          failOnCancel: false,
          url: downloadUri,
        })
        await FileSystem.deleteAsync(downloadUri, { idempotent: true })
      }
      return downloadUri
    } catch (err) {
      consoleError(err)
    }
    return undefined
  }

  return { fetch: fetchAttachment, cancel: download.cancel }
}

export const deleteCacheFile = async (path: string = '') => {
  try {
    const normalizedPath = path.startsWith('file://') ? path : `file://${path}`
    if (path?.includes('AppGroup')) {
      deleteAppGroupFile(normalizedPath)
    } else {
      const fileInfo = await FileSystem.getInfoAsync(normalizedPath)
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(normalizedPath, { idempotent: true })
      }
    }
  } catch (error) {
    consoleError(error)
  }
}

export const deleteAttachmentsFromCache = (attachments: Array<UploadFile>) => {
  attachments.forEach((attachment) => {
    if (attachment.previewPath) {
      deleteCacheFile(attachment.previewPath)
    } else if (attachment.path) {
      deleteCacheFile(attachment.path)
    }
  })
}
