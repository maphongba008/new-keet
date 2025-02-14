import { logError } from '@holepunchto/keet-store/store/error'

import { IS_SENTRY_ENABLED } from './build.constants'
import { Sentry } from './sentry'
import { getDispatch } from './store'

// Global error handler, This will be triggered if error is not handled with try...catch
ErrorUtils.setGlobalHandler((error: Error) => {
  const dispatch = getDispatch()
  dispatch(logError(error))
})

// TODO: Add more specific typing
export const consoleError = async (error: any, ...extra: any) => {
  const dispatch = getDispatch()
  dispatch(logError(error))

  if (IS_SENTRY_ENABLED) {
    Sentry.withScope((scope: any) => {
      if (extra[0]?.coreUnhandledError) {
        scope.setExtras(error)
        Sentry.captureException(new Error(`[CORE_ERROR] ${error?.message}`), {
          level: 'error',
        })
        return
      }
      extra && scope.setExtras(extra)
      Sentry.captureException(error, { level: 'error' })
    })
  } else {
    const errorMsg =
      typeof error === 'object' && error.message ? error.message : error
    console.error(errorMsg, extra)
  }
}
