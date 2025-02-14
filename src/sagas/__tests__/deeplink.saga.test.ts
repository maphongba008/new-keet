import { call, put, select } from 'redux-saga/effects'

import { getAppCurrentCallRoomId } from '@holepunchto/keet-store/store/app'
import {
  joinRoomSubmit,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'

import {
  handleDeeplink,
  handleDeeplinkSaga,
  handleKeetUrl,
  handlePushUrl,
} from 'sagas/deeplink.saga'

import { KEET_URL_PREFIX, ROOM_PUSH_URL_PREFIX } from 'lib/constants'
import { showErrorNotifier } from 'lib/hud'
import * as Navigation from 'lib/navigation'

import { getStrings } from 'i18n/strings'

describe('Deeplink Saga', () => {
  const type = handleDeeplink.toString()

  describe('Keet url deeplinks', () => {
    it('calls handleKeetUrl for keet:// url', () => {
      const action = {
        type,
        payload: `${KEET_URL_PREFIX}test`,
      }
      const iterator = handleDeeplinkSaga(action)
      iterator.next()
      expect(iterator.next().value).toEqual(call(handleKeetUrl, action.payload))
      expect(iterator.next().done).toBeTruthy()
    })

    it('supports keet://screen/call url only', () => {
      const iterator = handleKeetUrl(`${KEET_URL_PREFIX}test`)
      expect(iterator.next().done).toBeTruthy()

      const iterator2 = handleKeetUrl(`${KEET_URL_PREFIX}screen/test`)
      expect(iterator2.next().done).toBeTruthy()
    })

    it('switch to Call Screen', () => {
      const roomId = 'testRoomId'
      const navigationSpy = jest.spyOn(Navigation, 'navigate')
      jest.spyOn(Navigation.navigationRef, 'isReady').mockReturnValue(true)
      const iterator = handleKeetUrl(`${KEET_URL_PREFIX}screen/call`)
      expect(iterator.next().value).toEqual(select(getAppCurrentCallRoomId))
      expect(iterator.next(roomId).value).toEqual(
        put(switchRoomSubmit({ roomId })),
      )
      expect(iterator.next().done).toBeTruthy()
      expect(navigationSpy).toHaveBeenCalledWith(
        Navigation.SCREEN_ROOM_CALL,
        expect.objectContaining({
          roomId,
        }),
      )
    })
  })

  describe('Push url deeplinks', () => {
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {})
    })
    it('calls handlePushUrl for pear://push/ url', () => {
      const action = {
        type,
        payload: `${ROOM_PUSH_URL_PREFIX}testPushId`,
      }
      const iterator = handleDeeplinkSaga(action)
      iterator.next()
      expect(iterator.next().value).toEqual(call(handlePushUrl, action.payload))
      expect(iterator.next().done).toBeTruthy()
    })
    it('return early if cannot parse roomId', () => {
      const iterator = handlePushUrl(`${ROOM_PUSH_URL_PREFIX}testRoomId`)
      expect(iterator.next()).toBeTruthy()
    })
  })

  describe('Room Invitation deeplinks', () => {
    it('calls joinRoomSubmit for room invite urls', () => {
      const action = {
        type,
        payload:
          'pear://keet/yrywiyt5ay1xzsw8wkzmtbeikxpmnijxuz7akmajet49xxap97o3kkdyjc1b7dh4gbxkh9apmzn8szr3wdyosa8bdbmja47pp48pjmf7dh',
      }
      const iterator = handleDeeplinkSaga(action)
      iterator.next()
      expect(iterator.next().value).toEqual(
        put(joinRoomSubmit({ link: action.payload })),
      )
    })
  })

  describe('show Error notifier when tap pear, but not keet url', () => {
    it('show Error notice', () => {
      const {
        common: { deeplinkNotSupported },
      } = getStrings()
      const action = {
        type,
        payload: 'pear://test',
      }
      const iterator = handleDeeplinkSaga(action)
      iterator.next()
      expect(iterator.next().value).toEqual(
        call(showErrorNotifier, deeplinkNotSupported, false),
      )
    })
  })
})
