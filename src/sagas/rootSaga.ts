// @ts-nocheck
import {
  actionChannel,
  all,
  call,
  delay,
  fork,
  getContext,
  put,
  select,
  take,
  takeEvery,
  takeLatest,
  takeLeading,
} from 'redux-saga/effects'
import _includes from 'lodash/includes'

import { getMobileBackend } from '@holepunchto/keet-store/backend'
import {
  APP_STATUS,
  appCallManagerSaga,
  appChatAddMessageSaga,
  appChatUpdateMessageSaga,
  appDmResponseSaga,
  appRoomJoinSaga,
  appRoomsPresencesSaga,
  appRoomSwitchSaga,
  appRootFunctionalitySaga,
  currentRoomSaga,
  getAppCurrentRoomId,
  initApplication,
  mobileRoomNotificationsSaga,
  setAppCurrentRoomId,
  setAppLocale,
  setAppNotificationsType,
  setAppNotificationsTypeSaga,
  setAppStatus,
} from '@holepunchto/keet-store/store/app'
import { appErrorSaga } from '@holepunchto/keet-store/store/app/saga/app-error.saga'
import { appUpdateRequiredSaga } from '@holepunchto/keet-store/store/app/saga/app-update.saga'
import { cacheDataRehydrateEvt } from '@holepunchto/keet-store/store/cache'
import {
  sendChatMessageSubmit,
  updateChatMessageSubmit,
} from '@holepunchto/keet-store/store/chat'
import { taskErrorSaga } from '@holepunchto/keet-store/store/error'
import {
  identitySaga,
  loadIdentitySync,
  setSyncDeviceSeedId,
  setSyncDeviceSyncRequest,
} from '@holepunchto/keet-store/store/identity'
import { createSpawnRestarted } from '@holepunchto/keet-store/store/lib'
import { safeCall } from '@holepunchto/keet-store/store/lib/effects'
import { resetModuleStateCmd } from '@holepunchto/keet-store/store/lib/rootAction.js'
import { calcProfileColor } from '@holepunchto/keet-store/store/member'
import {
  APP_CONTEXT_KEY,
  PLATFORM_CONTEXT_KEY,
} from '@holepunchto/keet-store/store/mobile'
import { networkSaga } from '@holepunchto/keet-store/store/network'
import {
  getPreferencesLocale,
  preferencesInitData,
  preferencesSaga,
} from '@holepunchto/keet-store/store/preferences'
import {
  clearPairingRoom,
  closeRoomSubmit,
  createRoomSubmit,
  EMPTY_ROOM_ID,
  getRoomPairingIdActive,
  joinRoomSubmit,
  leaveRoomSubmit,
  leaveRoomSuccessEvent,
  roomCreateHandler,
  roomLeaveHandler,
  roomListSaga,
  roomSaga,
  setPairingRoom,
  setRoomPairingActive,
  setRoomVersion,
  switchRoomSubmit,
} from '@holepunchto/keet-store/store/room'
import { roomListCacheOnUpdateSaga } from '@holepunchto/keet-store/store/room/cache/room-cache.saga'
import { dmReplySubmit } from '@holepunchto/keet-store/store/room/dm/room-dm.reducer'
import { statsSaga } from '@holepunchto/keet-store/store/stats'
import {
  getUserProfile,
  PROFILE_SECTIONS,
  setProfileCurrentSection,
  setUserProfile,
} from '@holepunchto/keet-store/store/userProfile'
import { userProfileSaga } from '@holepunchto/keet-store/store/userProfile/userProfile.saga'

import {
  closeAppModal,
  getAppState,
  initializeNavigator,
  setAppState,
  setStoreReady,
  showAppModal,
} from 'reducers/application'

import { SHARE_CONTENT_URL } from 'lib/constants'
import { consoleError } from 'lib/errors'
import { showErrorNotifier } from 'lib/hud'
import {
  APP_ROOT,
  getCurrentRoute,
  navigate,
  navReplace,
  SCREEN_HOME,
  SCREEN_IDENTITY_SYNC,
} from 'lib/navigation'

import { appEvents } from './appEventsSaga'
import { callSaga } from './callSaga'
import { coreErrorHandler } from './coreErrorHandlerSaga'
import { handleDeeplink, handleDeeplinkSaga } from './deeplink.saga'
import { copyEventAction, copyEventSaga } from './eventLongPressSaga'
import lobbySaga from './lobby.saga'
import { modalCloseSaga, modalOpenSaga } from './modalSaga'
import { pushNotificationSaga } from './pushNotificationsSaga'
import {
  batchJoinRoomHandler,
  handleBatchJoinRoom,
  handleForwardMessage,
  handleForwardMessageSaga,
  joinRoomHandler,
  roomPairingNotificationSaga,
} from './roomsSaga'
import { storageSaga } from './storageSaga'
import { updateVersionSaga } from './updateVersionSaga'
import { handlePriorityModals } from './workflowSaga'

export function* appStateCleanup() {
  yield put(resetModuleStateCmd())
}

const spawnRestarted = createSpawnRestarted({ onError: taskErrorSaga })

function* setUserProfileColor() {
  try {
    const { color } = yield select(getUserProfile)
    if (!color) {
      const swarmId = yield call(getMobileBackend().getSwarmId)
      yield put(setUserProfile({ color: calcProfileColor(swarmId) }))
    }
  } catch (err) {
    console.log('Error in set User profile color', err)
  }
}

export function* appInitialStartupHandler() {
  try {
    const { applicationKey } = yield getContext(PLATFORM_CONTEXT_KEY)
    yield put(initApplication({ applicationKey }))
    yield preferencesInitData()

    yield call(loadIdentitySync)

    const locale = yield select(getPreferencesLocale)
    const { localeManager } = yield getContext(APP_CONTEXT_KEY)
    yield localeManager.setLocale(locale)
    yield put(setAppLocale(locale))

    yield setUserProfileColor()
    yield put(setAppStatus(APP_STATUS.RUNNING))
    yield put(setAppState('active'))
    // Call this action to trigger getting software versions from keet-store
    // https://github.com/holepunchto/keet-store/blob/main/store/userProfile/userProfile.saga.js#L134
    yield put(setProfileCurrentSection(PROFILE_SECTIONS.NETWORK_STATUS))
  } catch (e) {
    console.log('appInitialStartupHandler error', e)
    yield call(showErrorNotifier, e.message)
    yield call(consoleError, e)
  }
}

export function* appNavigatorHandler() {
  try {
    const { config } = yield getContext(PLATFORM_CONTEXT_KEY)
    const initialUrl = yield config.getInitialURL()
    yield handlePriorityModals()
    if (!_includes(initialUrl, SHARE_CONTENT_URL)) {
      yield put(handleDeeplink(initialUrl))
    }
    yield put(initializeNavigator())
  } catch (e) {
    console.log('appNavigatorHandler error', e)
    yield call(showErrorNotifier, e.message)
    yield call(consoleError, e)
  }
}

export function* appRoomListHandlerSaga() {
  yield takeEvery(setRoomPairingActive, function* appRoomPairingHandler() {
    const activePairingSeedId = yield select(getRoomPairingIdActive)
    if (activePairingSeedId) {
      yield put(setAppCurrentRoomId({ roomId: EMPTY_ROOM_ID }))
    }
  })
}

function* appMobileHandlerSaga() {
  yield takeLatest(setAppCurrentRoomId, function* ({ payload: prevPayload }) {
    const nextPayload = { ...prevPayload, onJoinNotifications: true }
    yield fork(currentRoomSaga, { payload: nextPayload })
  })
  yield takeEvery(createRoomSubmit, roomCreateHandler)
  yield fork(appRoomListHandlerSaga)
  yield takeEvery(joinRoomSubmit, appRoomJoinSaga)
  yield takeLatest(joinRoomSubmit, joinRoomHandler)
  yield takeEvery(dmReplySubmit, appDmResponseSaga)
  yield takeEvery(switchRoomSubmit, appRoomSwitchSaga)
  yield takeLeading(leaveRoomSubmit, roomLeaveHandler)
  yield takeEvery(
    leaveRoomSuccessEvent,
    function* leaveRoomSuccessHandler({ payload: roomId }) {
      const currentRoomId: string = yield select(getAppCurrentRoomId)
      //showInfoNotifier('Room left successfully')
      if (roomId === currentRoomId) {
        yield put(setAppCurrentRoomId({ roomId: '' }))
        navigate(APP_ROOT, { screen: SCREEN_HOME })
      }
    },
  )
  yield takeEvery(closeRoomSubmit, function* closeRoomSubmitHandler() {
    try {
      yield put(setAppCurrentRoomId({ roomId: '' }))
      navigate(APP_ROOT, { screen: SCREEN_HOME })
    } catch (error) {
      console.error('Error in closeRoomSubmitHandler:', error)
    }
  })

  yield takeLatest(setAppNotificationsType, setAppNotificationsTypeSaga)
  yield takeEvery(sendChatMessageSubmit, appChatAddMessageSaga)
  yield takeEvery(updateChatMessageSubmit, appChatUpdateMessageSaga)
  yield takeEvery(setRoomVersion, appUpdateRequiredSaga)

  // follows are mobile only
  yield takeLatest(showAppModal, modalOpenSaga)
  yield takeLatest(closeAppModal, modalCloseSaga)

  // call sagas
  yield fork(callSaga)

  // push sagas
  yield fork(pushNotificationSaga)

  yield takeLatest(handleForwardMessage, handleForwardMessageSaga)
  yield takeLatest(handleBatchJoinRoom, batchJoinRoomHandler)
  yield takeEvery(
    [setPairingRoom, clearPairingRoom],
    roomPairingNotificationSaga,
  )
  yield takeLatest(copyEventAction, copyEventSaga)
}

// Queue all actions and dispatch after store ready
function* queueActionsWhileReady() {
  const actionQueue = []
  const avoidQueueActions = [cacheDataRehydrateEvt.type]
  const requestChannel = yield actionChannel('*')
  while (true) {
    const action = yield take(requestChannel)
    if (action.type === setStoreReady.type) {
      break
    }
    if (!avoidQueueActions.includes(action.type)) {
      actionQueue.push(action)
    }
  }

  yield delay(2000)
  for (const queuedAction of actionQueue) {
    yield put(queuedAction)
  }
}

function* appStateFunctionalitySaga(byStatus: any) {
  let functionalityTasks = []
  let prevStatus = ''
  while (true) {
    yield take(setAppState)
    const { appState } = yield select(getAppState)
    if (prevStatus === appState) {
      continue
    }
    prevStatus = appState
    functionalityTasks.forEach((task: any) => {
      if (task.isRunning()) {
        task.cancel()
      }
    })
    if (appState === 'active') {
      functionalityTasks = yield all(byStatus[appState].map(spawnRestarted))
    }
  }
}

// desktop equivalents in https://github.com/holepunchto/keet-store/blob/main/store/app/app-desktop.saga.js
export function* mobileAppSaga() {
  yield fork(roomListCacheOnUpdateSaga)
  yield fork(queueActionsWhileReady)
  yield take(setStoreReady)

  yield spawnRestarted(appErrorSaga)

  // restart some functionality if required
  yield fork(appRootFunctionalitySaga, {
    [APP_STATUS.RUNNING]: [
      appMobileHandlerSaga,
      appCallManagerSaga,
      mobileRoomNotificationsSaga,
      roomSaga,
      roomListSaga,
      appRoomsPresencesSaga,
    ],
    [APP_STATUS.IDENTITY_SETUP]: [appStateCleanup],
  })

  yield takeLatest(handleDeeplink, handleDeeplinkSaga)

  // refactor to sep file when need to include more functions related to identity or navigation
  yield takeEvery(
    [setSyncDeviceSeedId, setSyncDeviceSyncRequest],
    function* ({ payload: seedId }) {
      const route = getCurrentRoute()
      if (seedId && route !== SCREEN_IDENTITY_SYNC) {
        const navigationFunc = route === SCREEN_HOME ? navigate : navReplace
        navigationFunc(SCREEN_IDENTITY_SYNC)
      }
    },
  )

  // once the app started, run global functionality handlers forever
  yield fork(appStateFunctionalitySaga, {
    background: [],
    active: [networkSaga],
  })
  yield spawnRestarted(coreErrorHandler)
  yield spawnRestarted(appEvents)
  yield spawnRestarted(statsSaga)
  yield safeCall(appInitialStartupHandler)

  yield spawnRestarted(preferencesSaga)
  yield spawnRestarted(identitySaga)
  yield fork(lobbySaga)
  yield spawnRestarted(storageSaga)
  yield spawnRestarted(userProfileSaga)
  yield spawnRestarted(updateVersionSaga)
  yield safeCall(appNavigatorHandler)
}
