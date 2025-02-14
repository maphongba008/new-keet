import { getMobileBackend } from '@holepunchto/keet-store/backend'
import { apiSubscribeSaga } from '@holepunchto/keet-store/store/lib'

import { consoleError } from 'lib/errors'

// expo-image-picker error on android when allowEditing is enabled
// https://app.asana.com/0/1208330559943071/1208788511716756/f
// silence error as doesn't break anything and re-test after expo sdk upgrade
const IGNORE_ERRORS: string[] = ['free is not a function']

export function* coreErrorHandler() {
  const mobileApi = getMobileBackend()

  yield apiSubscribeSaga(
    () => mobileApi.subscribeUnhandledErrors(),
    (err: Error) => {
      if (IGNORE_ERRORS.includes(err?.message)) {
        return
      }
      consoleError(err, { coreUnhandledError: true })
    },
  )
}
