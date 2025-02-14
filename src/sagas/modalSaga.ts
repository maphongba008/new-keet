// @ts-nocheck
import { select, take } from 'redux-saga/effects'

import {
  closeAppModal,
  closeWalkthroughTooltip,
  getAppModalState,
  getAppModalVisible,
  getAppNavigatorIsMounted,
  getAppNavigatorIsReady,
  getIsStoreReady,
  getWalkthroughTooltip,
  initializeNavigator,
  ModalState,
  mountNavigator,
  setStoreReady,
} from 'reducers/application'

import {
  back,
  getCurrentRoute,
  navigate,
  SCREEN_HOME,
  SCREEN_MODAL,
} from 'lib/navigation'

export function* waitForModalsToClose() {
  while (yield select(getAppModalVisible)) {
    yield take(closeAppModal)
  }
}

export function* modalOpenSaga(): Generator<unknown, void, any> {
  const appModalState: ModalState = yield select(getAppModalState)

  if ('queue' in appModalState && appModalState.queue.length === 1) {
    navigate(SCREEN_MODAL)
  }
}

export function* modalCloseSaga(): Generator<unknown, void, any> {
  const appModalIsVisible: ModalState = yield select(getAppModalVisible)

  if (!appModalIsVisible) {
    back()
  }
}

export function* waitForStoreReady() {
  while (!(yield select(getIsStoreReady))) {
    yield take(setStoreReady)
  }
}

export function* waitForNavigatorMount() {
  while (!(yield select(getAppNavigatorIsMounted))) {
    yield take(mountNavigator)
  }
}

export function* waitForNavigatorReady() {
  while (!(yield select(getAppNavigatorIsReady))) {
    yield take(initializeNavigator)
  }
}

export function* waitForToolTip() {
  while (yield select(getWalkthroughTooltip)) {
    yield take(closeWalkthroughTooltip)
  }
}

export function* waitToShowHome() {
  while (true) {
    yield take('*')
    const currentRoute = getCurrentRoute()
    if (currentRoute === SCREEN_HOME) {
      return
    }
  }
}
