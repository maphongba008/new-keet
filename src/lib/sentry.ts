import { IS_SENTRY_ENABLED } from './build.constants'

const SENTRY_IGNORE_ERRORS: string[] = ['User did not share']

export const Sentry = {
  init: (_config: any) => {},
  wrap: (children: any) => children,
  withScope: (_scope: any) => {},
  captureException: (
    _exception: any,
    _hint?: {
      level?: 'fatal' | 'error' | 'warning' | 'log' | 'info' | 'debug'
    },
  ): string => '',
}

export const initSentry = (): any => {
  if (IS_SENTRY_ENABLED) {
    Sentry.init({
      dsn: 'https://c01b464fd3f0f0334d9d483d95b6f067@o139579.ingest.us.sentry.io/4506301620944896',
      tracesSampleRate: 0.5,
      enableAppHangTracking: true,
      enableTracing: true,
      attachScreenshot: true,
      attachViewHierarchy: true,
      attachStacktrace: true,
      ignoreErrors: SENTRY_IGNORE_ERRORS,
      _experiments: {
        profilesSampleRate: 0.5,
      },
    })

    // Getting undefined error on Promise.allSettled, missing polyfill after initSentry
    // Unsure of the issue as nothing reported on github yet, So polyfill manually.
    Promise.allSettled =
      Promise.allSettled ||
      ((promises: any) =>
        Promise.all(
          promises.map((p: any) =>
            p
              .then((value: any) => ({
                status: 'fulfilled',
                value,
              }))
              .catch((reason: any) => ({
                status: 'rejected',
                reason,
              })),
          ),
        ))
  }
}
