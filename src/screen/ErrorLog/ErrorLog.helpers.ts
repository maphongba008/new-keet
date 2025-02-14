import { getStrings } from 'i18n/strings'

import { ErrorType } from './ErrorLog'

export const getErrorLogText = (error: ErrorType) => {
  const { errorLog: strings } = getStrings()
  const roomTitle = error?.roomTitle
    ? `${strings.room} ${error.roomTitle}\n`
    : ''
  const timestamp = error?.timestamp
    ? `${strings.time} ${new Date(error.timestamp).toISOString()}\n`
    : ''
  const message = error?.message ? `${error.message}\n` : ''
  const stack = error?.stack ? `${error.stack}\n` : ''

  return roomTitle + timestamp + message + stack
}
