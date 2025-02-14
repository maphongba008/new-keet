import { AppState, AppStateStatus, Linking } from 'react-native'
import {
  addRingerListener,
  addSilentListener,
  Mode,
  RingerSilentStatus,
} from 'react-native-volume-manager'
import { eventChannel } from 'redux-saga'
import { call, delay, put, takeEvery, takeLeading } from 'redux-saga/effects'
import _includes from 'lodash/includes'
import _reject from 'lodash/reject'

import {
  setAppState,
  setIsOnSilentMode,
  setShareContent,
} from 'reducers/application'

import { closeBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { MAX_SHARE_COUNT, SHARE_CONTENT_URL } from 'lib/constants'
import { consoleError } from 'lib/errors'
import { showInfoNotifier } from 'lib/hud'
import { APP_ROOT, reset } from 'lib/navigation'
import { isAndroid } from 'lib/platform'
import {
  getShareContent,
  resetShareContent,
  type MaxShareSize,
  type ShareContent,
} from 'lib/shareContent'

import { handleDeeplink } from './deeplink.saga'
import {
  handleShareContent,
  waitForAuthenticated,
  waitForNavigation,
} from './helper.saga'
import { waitForStoreReady } from './modalSaga'
import { waitForShareContentNull } from './roomsSaga'

const LINK_URL_CHANGE = 'LINK_URL_CHANGE'
const IOS_SILENT_EVENT = 'IOS_SILENT_EVENT'
const ANDROID_RINGER_EVENT = 'ANDROID_RINGER_EVENT'
const APP_STATE_EVENT = 'APP_STATE_EVENT'

function* onAppEvents({ type, payload }: AppEvent) {
  try {
    switch (type) {
      case APP_STATE_EVENT:
        yield put(setAppState(payload))
        if (payload === 'active') {
          if (isAndroid) {
            yield put(handleShareContent())
          }
        }
        break
      case LINK_URL_CHANGE: {
        yield waitForStoreReady()
        // iOS Triggers deeplink with SHARE_CONTENT_URL when try open via share extension
        if (_includes(payload, SHARE_CONTENT_URL)) {
          yield put(handleShareContent())
        } else {
          yield put(handleDeeplink(payload))
        }
        break
      }
      case IOS_SILENT_EVENT:
        yield put(setIsOnSilentMode(payload))
        break
      case ANDROID_RINGER_EVENT:
        yield put(setIsOnSilentMode(payload !== Mode.NORMAL))
        break
      default:
    }
  } catch {}
}

const hasMaxSizePredicate = (item: MaxShareSize | ShareContent) =>
  (item as MaxShareSize).maxShareSize === true

export function* shareContentSaga() {
  try {
    let shareContent: Array<ShareContent | MaxShareSize> =
      yield call(getShareContent)
    if (!shareContent) {
      return
    }
    // wait for passcode check
    yield delay(100)
    yield waitForAuthenticated()
    if (shareContent?.some(hasMaxSizePredicate)) {
      yield call(
        showInfoNotifier,
        `You can only share up to ${MAX_SHARE_COUNT} files at a time.`,
      )
      shareContent = _reject(shareContent, hasMaxSizePredicate)
    }
    if (shareContent) {
      yield call(waitForNavigation)
      closeBottomSheet()
      // Pop to Top or else on click device back button, app will navigate back to previous screen with which it's minimized
      yield reset(APP_ROOT)
      yield waitForShareContentNull()
    }
    yield put(setShareContent(shareContent))
    yield call(resetShareContent)
  } catch (e) {
    consoleError('Failed to process share content:', e)
  }
}

type AppEvent =
  | {
      type: typeof APP_STATE_EVENT
      payload: AppStateStatus
    }
  | {
      type: typeof LINK_URL_CHANGE
      payload: string
    }
  | {
      type: typeof IOS_SILENT_EVENT
      payload: boolean
    }
  | {
      type: typeof ANDROID_RINGER_EVENT
      payload: RingerSilentStatus['mode']
    }

export function* appEvents() {
  try {
    const channel = eventChannel<AppEvent>((emitter) => {
      const onAppStatusChange = (nextAppState: AppStateStatus) => {
        emitter({
          type: APP_STATE_EVENT,
          payload: nextAppState,
        })
      }

      const appStateListener = AppState.addEventListener(
        'change',
        onAppStatusChange,
      )

      const LinkingUrllistener = ({ url }: { url: string }) =>
        emitter({
          type: LINK_URL_CHANGE,
          payload: url,
        })

      const linkingSubscription = Linking.addEventListener(
        'url',
        LinkingUrllistener,
      )

      const iosSilentEmitter = ({ isMuted }: { isMuted: boolean }) =>
        emitter({
          type: IOS_SILENT_EVENT,
          payload: isMuted,
        })
      const iosSilentListener = addSilentListener(iosSilentEmitter)

      const androidRingerEmitter = ({ mode }: RingerSilentStatus) =>
        emitter({
          type: ANDROID_RINGER_EVENT,
          payload: mode,
        })
      const androidRingerListener = addRingerListener(androidRingerEmitter)

      return () => {
        appStateListener.remove()
        linkingSubscription.remove()
        iosSilentListener.remove()
        androidRingerListener.remove()
      }
    })
    yield takeEvery(channel, onAppEvents)
    yield takeLeading(handleShareContent, shareContentSaga)
    yield put(handleShareContent())
  } catch (e) {
    consoleError('Failed to process appEvents:', e)
  }
}
