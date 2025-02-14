import { isRejectedWithValue } from '@reduxjs/toolkit'

import { showErrorNotifier } from 'lib/hud'

export const rtkQueryErrorNotifyMiddleware =
  () => (next: any) => (action: any) => {
    next(action)
    if (isRejectedWithValue(action) && action?.payload) {
      const { message, endpoint } = action?.payload
      showErrorNotifier(`${endpoint}: ${message}`, false)
    }
  }
