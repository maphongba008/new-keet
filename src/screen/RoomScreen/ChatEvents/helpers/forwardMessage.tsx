// https://github.com/holepunchto/keet-desktop/blob/main/src/components/chat/utils.js

import { Dispatch } from 'react'
import { UnknownAction } from '@reduxjs/toolkit'
import _get from 'lodash/get'
import _noop from 'lodash/noop'

import { handleForwardMessage } from 'sagas/roomsSaga'

import { downloadAndShare, normalizeUri } from 'lib/download'
import { popToTop } from 'lib/navigation'
import { ChatEventType } from 'lib/types'
import { isString } from 'lib/validation'

export const forwardMessage = async (
  dispatch: Dispatch<UnknownAction>,
  event: ChatEventType,
  opts = {},
) => {
  const text = _get(event, 'chat.text', null)

  let shareContent
  if (isString(text)) {
    shareContent = {
      mimeType: 'text/plain',
      text,
      media: null,
    }
  } else {
    const mimeType = _get(event, 'file.type', '')
    const dimensions = _get(event, 'file.dimensions', {})
    const uri = _get(opts, 'src', '')
    const name = _get(event, 'file.key', '')
    const byteLength = _get(opts, 'byteLength', 0)
    const { fetch } = downloadAndShare({ uri, type: mimeType }, _noop)
    const fileUri = await fetch()
    shareContent = {
      mimeType,
      text: null,
      media: {
        uri: normalizeUri(fileUri),
        name,
        ...dimensions,
        byteLength,
      },
    }
  }

  dispatch(handleForwardMessage(shareContent))
  popToTop()
}
