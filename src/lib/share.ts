import { View } from 'react-native'
import { randomUUID } from 'expo-crypto'
import * as FileSystem from 'expo-file-system'
import Share from 'react-native-share'
import { captureRef, captureScreen } from 'react-native-view-shot'

import { consoleError } from 'lib/errors'

import { ensureMediaLibraryPermissions } from './download'
import { isAndroid } from './platform'

const format = 'png'
const quality = 0.8

export const shareUrl = (url: string, message?: string) => {
  Share.open({
    url,
    message,
    failOnCancel: false,
  })
}

export const shareText = (message: string) => {
  Share.open({
    message,
    failOnCancel: false,
  })
}

async function getCustomFileName(uri: string) {
  const uriArray = uri.split('/')
  const fileNameToChange = uriArray[uriArray.length - 1]
  const newUri = uri.replace(fileNameToChange, `IMG-${randomUUID()}.png`)
  await FileSystem.copyAsync({ from: uri, to: newUri })
  return newUri
}

export async function getSnapshot(viewRef: View) {
  try {
    let uri
    if (!viewRef) {
      uri = await captureScreen({
        format,
        quality,
      })
    } else {
      uri = await captureRef(viewRef, {
        format,
        quality,
      })
    }
    let localUri = uri
    if (isAndroid) {
      localUri = await getCustomFileName(uri)
    }
    return `file://${localUri}`
  } catch (error) {
    consoleError('Oops, snapshot failed', error)
  }
}

export async function shareToDevice(uri: string) {
  try {
    await ensureMediaLibraryPermissions()
    await Share.open({ url: uri, type: 'image/png', failOnCancel: false })
  } catch (error) {
    consoleError('an error occurred here: ', error)
  }
}
