import { useCallback, useEffect, useRef } from 'react'
import { PasteInputRef } from '@mattermost/react-native-paste-input'
import _find from 'lodash/find'
import _get from 'lodash/get'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'
import _startsWith from 'lodash/startsWith'

import { getShareContent } from 'reducers/application'

import { consoleError } from 'lib/errors'
import { getMediaType } from 'lib/fs'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import { getStorageChatDraft, setStorageChatDraft } from 'lib/localStorage'
import { type ShareContent } from 'lib/shareContent'
import { SendFilesInfo } from 'lib/types'
import { useRoomUploads } from 'lib/uploads'

/**
 * Restore draft from local storage on first enter room
 * If shareContent available in store, save it to inputs
 */
export function useRestoreDraftOnLoad(
  roomId: string,
  inputRef: React.RefObject<PasteInputRef>,
  setText: (text: string) => void,
  setSelection: ({ start, end }: { start: number; end: number }) => void,
  onSendFiles: (data: SendFilesInfo) => void,
) {
  const shareContents = useDeepEqualSelector(getShareContent)
  const uploads = useRoomUploads(roomId)

  const restoreDraft = useCallback(() => {
    try {
      const text = getStorageChatDraft(roomId)
      if (text) {
        setText(text)
        setSelection({ start: text.length, end: text.length })
      }
    } catch (e) {
      consoleError('Error restoring chat draft:', e)
    }
  }, [roomId, setSelection, setText])

  useEffect(() => {
    // =============
    // Share Content: check for mimeType and set inputs based on data
    // =============
    if (shareContents && shareContents.length > 0) {
      _map(shareContents, (shareContent: ShareContent) => {
        const { mimeType = '', text = '' } = shareContent
        if (_startsWith(mimeType, 'text/') && text) {
          setText(text || '')
          inputRef.current?.focus()
        } else {
          const { media } = shareContent
          const { isImage, isVideo } = getMediaType(media?.uri ?? '', mimeType)
          const name = _get(media, 'name', '')
          const isAlreadyAvailable = _find(uploads, ['id', name])
          if (isAlreadyAvailable || !media) return // Avoid duplicate upoad item for same share content

          const sendInfo: SendFilesInfo = {
            uri: media?.uri,
            type: mimeType,
            name: media?.name,
            dimensions:
              isImage || isVideo
                ? {
                    width: media?.width,
                    height: media?.height,
                  }
                : undefined,
            byteLength: media?.byteLength || 0,
          }
          onSendFiles(sendInfo)
        }
      })
    } else {
      restoreDraft()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareContents])
}

/**
 * Save draft in local storage on every text change
 */
export function useAutoSaveDraft(
  roomId: string,
  text: string,
  editingMessageId: any,
) {
  // canPost in RoomScreen.tsx change from true => false => true, ChatInput was re-created, this hooks was called twice and we lost the draft
  const isInitialRenderRef = useRef(true)
  useEffect(() => {
    // do not save draft if it's the first render and text is empty
    if (isInitialRenderRef.current && _isEmpty(text)) {
      isInitialRenderRef.current = false
      return
    }
    if (_isEmpty(editingMessageId)) {
      setStorageChatDraft(roomId, text)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])
}
