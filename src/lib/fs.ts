import _includes from 'lodash/includes'
import _some from 'lodash/some'
import _startsWith from 'lodash/startsWith'

import { isIOS } from './platform'

export const imageRegEx = /.*\.(?:jpe?g|png|gif|bmp|webp|tif|tiff|heic|heif)$/
export const svgRegEx = /.*\.(?:svg)$/
export const videoRegEx = /.*\.(?:mp4|avi|mov|flv|wmv|mkv|webm|mpe?g)$/

type SUPPORTED_MAP_OPTIONS = {
  [key: string]: boolean
}

const IMAGE_SUPPORTED_MAP: SUPPORTED_MAP_OPTIONS = {
  jpg: true,
  jpeg: true,
  png: true,
  gif: true,
  bmp: true,
  webp: true,
  tif: isIOS,
  tiff: isIOS,
  heic: true,
  heif: isIOS,
  mpg: false,
  mpeg: false,
}

const VIDEO_SUPPORTED_MAP: SUPPORTED_MAP_OPTIONS = {
  mp4: true,
  mov: true,
  flv: false,
  avi: false,
  wmv: false,
  mkv: !isIOS,
  webm: true,
}

const IMAGE_TYPE_SUPPORTED_MAP: SUPPORTED_MAP_OPTIONS = {
  'image/jpg': true,
  'image/jpeg': true,
  'image/png': true,
  'image/gif': true,
  'image/bmp': true,
  'image/webp': true,
  'image/tiff': isIOS, // .tif, .tiff
  'image/heic': true, // .heic, .heif
}

const VIDEO_TYPE_SUPPORTED_MAP: SUPPORTED_MAP_OPTIONS = {
  'video/mp4': true,
  'video/quicktime': true, // mov
  'video/x-flv': false,
  'video/avi': false, // avi
  'video/x-ms-wmv': false, // wmv
  'video/x-matroska': !isIOS, // mkv
  'video/webm': true,
  'video/mpeg': false, // mpg, mpeg
}

const AUDIO_TYPE_SUPPORTED_MAP: SUPPORTED_MAP_OPTIONS = {
  'audio/ogg': !isIOS,
  'audio/aiff': isIOS,
}

// https://docs.expo.dev/versions/latest/sdk/audio-av/#constants Expo-audio high quality recording results in m4a
const VOICE_NOTE_FILE_TYPE = ['audio/x-m4a', 'audio/mpeg']

const supportedImageExtensions = Object.entries(IMAGE_SUPPORTED_MAP)
  .filter(([_, value]) => value)
  .map(([key]) => key)
const supportedVideoExtensions = Object.entries(VIDEO_SUPPORTED_MAP)
  .filter(([_, value]) => value)
  .map(([key]) => key)

export const isSupportedImageExtension = (name: string) =>
  _some(supportedImageExtensions, (extension) => name.includes(extension))
export const isSupportedVideoExtension = (name: string) =>
  _some(supportedVideoExtensions, (extension) => name.includes(extension))

export const isSupportedImageType = (type: string) =>
  IMAGE_TYPE_SUPPORTED_MAP[type] ?? true
export const isSupportedVideoType = (type: string) =>
  VIDEO_TYPE_SUPPORTED_MAP[type] ?? true
export const isSupportedAudioType = (type: string): boolean =>
  AUDIO_TYPE_SUPPORTED_MAP[type] ?? true

export const getFileName = (uri: string = ''): string =>
  decodeURIComponent(uri).split('/').pop()?.split('?')[0] ?? ''

export const getFileExtension = (uri: string = ''): string =>
  uri.includes('.') ? (getFileName(uri).split('.').pop() ?? '') : ''

export const getMediaTypeFromExtension = (fileName: string) => {
  const name = fileName?.toLowerCase() || ''
  const isImage = imageRegEx.test(name)
  const isVideo = videoRegEx.test(name)
  let isSupportedFileType = false
  if (isImage) {
    isSupportedFileType = isSupportedImageExtension(name)
  }
  if (isVideo) {
    isSupportedFileType = isSupportedVideoExtension(name)
  }

  return {
    isAudio: false,
    isImage: isImage,
    isSVG: svgRegEx.test(name),
    isSupportedFileType,
    isVideo: isVideo,
  }
}

export const getMediaTypeFromUrl = (uri: string) => {
  const urlRegEx = /(?:https?:\/\/)?([^/]+)(\/[^?]+)/
  const data = uri?.match(urlRegEx)
  if (!data) return { isImage: true }
  const { isImage, isVideo, isSVG } = getMediaTypeFromExtension(data?.[2])
  return { isImage, isVideo, isSVG }
}

export interface MediaTypeResult {
  isImage: boolean
  isVideo: boolean
  isAudio: boolean
  isSVG: boolean
  isSupportedFileType: boolean
}

/**
 * Generates a unique file name by appending a timestamp and random digit to the base name.
 * If the file name has an extension, the extension is preserved.
 *
 * @param {string} baseName - The base name of the file, with or without extension.
 * @returns {string} A unique file name with the format: prefixName_timestamp_randomDigit.suffixName
 */
export const generateUniqueFileName = (baseName: string): string => {
  const parts = baseName.split('.')
  const prefixName = parts.length > 1 ? parts.slice(0, -1).join('.') : baseName
  const suffixName = parts.length > 1 ? `.${parts.pop()!}` : ''
  const timestamp = Date.now()
  const randomDigit = Math.floor(Math.random() * 10)
  return `${prefixName}_${timestamp}_${randomDigit}${suffixName}`
}

export const getPathFromUri = (uri: string) => {
  const idx = uri.indexOf('://')
  if (idx < 0) {
    return uri
  }
  return uri.substring(idx + 3, uri.length)
}

export const getEncodedLocalUri = (uri: string, _name?: string) => {
  const name = _name ?? getFileName(uri)
  return uri.slice(0, uri.lastIndexOf('/') + 1) + encodeURIComponent(name)
}

export const getDecodedLocalUri = (uri: string) => {
  const name = getFileName(uri)
  return uri.slice(0, uri.lastIndexOf('/') + 1) + decodeURIComponent(name)
}

export function getMediaType(
  uri: string,
  type?: string | null,
): MediaTypeResult {
  const fileName = getFileName(uri)

  const mediaTypeFromExtension = getMediaTypeFromExtension(fileName)

  const result: MediaTypeResult = {
    isImage: false,
    isVideo: false,
    isAudio: false,
    isSVG: false,
    isSupportedFileType: false,
  }

  if (!type) return mediaTypeFromExtension
  const filetype = type?.toLowerCase()

  result.isImage =
    mediaTypeFromExtension.isImage || filetype?.includes('image/')
  result.isSVG =
    mediaTypeFromExtension.isSVG || filetype?.includes('image/svg+xml')
  result.isVideo = mediaTypeFromExtension.isVideo && filetype?.includes('video')
  result.isAudio = filetype?.includes('audio')

  if (result.isImage) {
    result.isSupportedFileType = isSupportedImageType(filetype)
  }
  if (result.isVideo) {
    result.isSupportedFileType = isSupportedVideoType(filetype)
  }
  if (result.isAudio) {
    result.isSupportedFileType = isSupportedAudioType(filetype)
  }
  return result
}

export function getIsVoiceNote(
  type: string | null = '',
  name: string = '',
): boolean {
  return (
    _includes(VOICE_NOTE_FILE_TYPE, type) && _startsWith(name, 'recording-')
  )
}
