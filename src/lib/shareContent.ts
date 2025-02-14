import { requireNativeModule } from 'expo-modules-core'

import { isAndroid } from './platform'

const KeetReceiveContentModule = requireNativeModule('KeetReceiveContentModule')

export interface MediaType {
  uri: string
  name: string
  width?: number
  height?: number
  byteLength: number
}

export interface ShareContent {
  mimeType: string
  text?: string | null
  media?: MediaType | null
}

export interface MaxShareSize {
  maxShareSize: boolean
}

export function getShareContent(): ShareContent | null {
  const shareContent = KeetReceiveContentModule.getShareContent()
  return shareContent
}

export function resetShareContent() {
  KeetReceiveContentModule.resetShareContent()
}

/**
 * @iOS only
 */
export function deleteAppGroupFile(path: string) {
  if (isAndroid) {
    return
  }
  KeetReceiveContentModule.deleteAppGroupFile(path)
}
