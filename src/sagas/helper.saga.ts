import { call, take } from 'redux-saga/effects'
import { createAction } from '@reduxjs/toolkit'

import { isUserAuthenticated } from 'lib/hooks'
import { hasNavigator } from 'lib/navigation'

export function* waitForNavigation(): any {
  try {
    if (yield call(hasNavigator)) {
      return
    }

    while (true) {
      yield take('*')
      if (yield call(hasNavigator)) {
        return
      }
    }
  } catch {}
}

export function* waitForAuthenticated(): any {
  try {
    if (yield call(isUserAuthenticated)) {
      return
    }

    while (true) {
      yield take('*')
      if (yield call(isUserAuthenticated)) {
        return
      }
    }
  } catch {}
}

export const handleShareContent = createAction('app/handle-share-content')
