import * as Clipboard from 'expo-clipboard'
import { call, delay, select } from 'redux-saga/effects'
import { createAction, PayloadAction } from '@reduxjs/toolkit'

import { emojify } from '@holepunchto/emojis'
import { getChatMessageById } from '@holepunchto/keet-store/store/chat'
import { getMemberById } from '@holepunchto/keet-store/store/member'

import { MemberByRoomI } from 'screen/RoomScreen/ChatEvent/hooks/useChatEventHandler'
import { showInfoNotifier } from 'lib/hud'
import { stripMentions } from 'lib/md'
import { ChatEventType, MemberType } from 'lib/types'

import { getStrings } from 'i18n/strings'

interface CopyEventSagaI {
  messageId: string
  roomId: string
}
export function* copyEventSaga({
  payload: { messageId, roomId },
}: PayloadAction<CopyEventSagaI>) {
  try {
    const strings: any = getStrings()
    const event: ChatEventType = yield select(getChatMessageById, messageId)
    const membersByRoom: MemberByRoomI = yield select(getMemberById(roomId))
    const text = event?.chat?.text
    const processedText = event.chat?.styledFragments
      ?.map((item) => {
        let content = text?.slice(item.start, item.end)

        for (const style of item.styles) {
          const mentionMemberId = style.content?.split('/')?.[0]
          const member: MemberType = membersByRoom?.[mentionMemberId]
          if (!member?.displayName) {
            continue
          }
          content = `@${member.displayName}`
        }
        return content
      })
      .join('')

    yield call(
      Clipboard.setStringAsync,
      emojify(stripMentions(processedText || '')),
    )
    yield delay(300) // theme.animation.ms * 2
    yield call(showInfoNotifier, strings.downloads.textCopied)
  } catch (err) {
    console.warn('Error while copy event saga', err)
  }
}

export const copyEventAction = createAction<CopyEventSagaI>(
  'longPressEvent/copy',
)
