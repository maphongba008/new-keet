import { FC, lazy, useMemo } from 'react'

import { MediaTypeResult } from 'lib/fs'
import { withSuspense } from 'lib/hoc/withSuspense'
import { isIOS, platformVersion } from 'lib/platform'

import { ChatEventFileAny } from '../ChatEventFileAny'
import { ChatEventFileImage } from '../ChatEventFileImage'

const ChatEventFileAudio = withSuspense(
  lazy(() => import('../ChatEventFileAudio')),
)
;(ChatEventFileAudio as FC<unknown>).displayName = 'ChatEventFileAudioLazy'
const ChatEventFileSVG = withSuspense(lazy(() => import('../ChatEventFileSVG')))
;(ChatEventFileSVG as FC<unknown>).displayName = 'ChatEventFileSVGLazy'
const ChatEventFileVideo = withSuspense(
  lazy(() => import('../ChatEventFileVideo')),
)
;(ChatEventFileVideo as FC<unknown>).displayName = 'ChatEventFileVideoLazy'

export interface UseChatFileComponentParams extends MediaTypeResult {
  hasPreview?: boolean
}

export const useChatFileComponent = ({
  isImage,
  isSVG,
  isVideo,
  isAudio,
  isSupportedFileType,
  hasPreview,
}: UseChatFileComponentParams) => {
  return useMemo(() => {
    if (isSVG) {
      if (isIOS && platformVersion && platformVersion <= 17) {
        return ChatEventFileAny
      }
      return ChatEventFileSVG
    }
    if (!isSupportedFileType) return ChatEventFileAny
    if (isImage) return ChatEventFileImage
    if (isVideo) return hasPreview ? ChatEventFileVideo : ChatEventFileAny
    if (isAudio) return ChatEventFileAudio
    return ChatEventFileAny
  }, [hasPreview, isAudio, isImage, isSVG, isSupportedFileType, isVideo])
}
