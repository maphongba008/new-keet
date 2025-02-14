import * as FileSystem from 'expo-file-system'

import { generateUniqueFileName, getFileExtension, getFileName } from './fs'
import { getMediaSizeAsync, getMimeTypeAsync } from './KeetVideoUtilsModule'

/**
 * Extracts all HTTP and HTTPS URLs from the given text.
 * @param text - The text to parse for URLs.
 * @returns An array of extracted URLs, or an empty array if none are found.
 */
export const parseRemoteUrls = (text: string): string[] => {
  const urlRegEx =
    /https?:\/\/(?:www.)?(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gim // remote https urls
  return text.match(urlRegEx) || []
}

/**
 * Tracks the domain of the URL.
 * @param url - The URL string to be transformed.
 * @returns The domain string or null.
 */
export const getUrlDomain = (url: string) => {
  try {
    const match = url.match(/^https?:\/\/([^/]+)/i)
    if (match?.[1]) {
      return match[1] // Return the domain
    }
  } catch (error) {
    return null
  }
}

export const normalizeUrlCase = (url: string): string => {
  return url.replace(/^(https?:\/\/)/i, (protocol) => protocol?.toLowerCase())
}

export const scaleImageWithinLimits = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
) => {
  if (!(originalHeight && originalWidth))
    return { width: maxWidth, height: maxWidth }

  const scale = Math.min(maxWidth / originalWidth, maxWidth / originalHeight)

  return {
    width: originalWidth * scale,
    height: originalHeight * scale,
  }
}

export const getAbsolutePath = (baseUrl: string, path: string) => {
  if (!path?.startsWith('/')) {
    return path
  }
  return `${baseUrl.replace(/\/+$/, '')}${path}`
}

export async function prefetchImage(imageUrl: string): Promise<string> {
  const fileName = generateUniqueFileName(getFileName(imageUrl))
  const extension = getFileExtension(fileName)
  const data = await FileSystem.downloadAsync(
    imageUrl,
    FileSystem.cacheDirectory + fileName,
  )

  const { uri, mimeType } = data

  const expectedExtension = mimeType?.split('/')[1] || 'png' // On Android the mimeTpe is undefined and it's not a reliable prop so added default type.

  let fileUri = uri

  // append extension if it's not defined initially
  if (expectedExtension && !extension) {
    fileUri = uri.replace(fileName, `${fileName}.${expectedExtension}`)
    await FileSystem.moveAsync({
      from: uri,
      to: fileUri,
    })
  }

  return fileUri.replace('file://', '')
}

export async function getFileInfo(
  fileUri: string,
  url: string,
): Promise<{
  byteLength: number
  dimensions: {
    height: number
    width: number
  } | null
  type: string | undefined
  name: string
}> {
  const fileInfo = await FileSystem.getInfoAsync(`file://${fileUri}`)

  const mimeType = await getMimeTypeAsync(
    `file://${decodeURIComponent(fileUri)}`,
  )

  const dimensions = await getMediaSizeAsync(`file://${fileUri}`, mimeType)

  let fileSize = 0
  if (fileInfo.exists) {
    fileSize = fileInfo?.size
  }

  const name = url.split('/')?.reverse?.()?.[0]
  const uniqueId = generateUniqueFileName(name)

  // Return the structured object
  return {
    byteLength: fileSize,
    dimensions,
    type: mimeType,
    name: uniqueId,
  }
}
