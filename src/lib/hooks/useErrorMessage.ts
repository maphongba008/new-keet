import { ERRORS } from '@holepunchto/keet-core-api'
import { GENERIC_PAIRING_ERROR } from '@holepunchto/keet-store/store/error'

import { getStrings } from 'i18n/strings'

interface ERROR_STRINGS {
  inviteExpired: string
  invalidInvitation: string
  genericPairingError: string
}

export const ERROR_MESSAGES = {
  [ERRORS.INVITE_EXPIRED]: (strings: ERROR_STRINGS) => strings.inviteExpired,
  [ERRORS.INVALID_INVITATION_TYPE]: (strings: ERROR_STRINGS) =>
    strings.invalidInvitation,
  [GENERIC_PAIRING_ERROR]: (strigns: ERROR_STRINGS) =>
    strigns.genericPairingError,
}

export const getErrorMessage = (message?: string) => {
  const { errorMessages: strings } = getStrings()
  if (!message) return undefined

  const errorCode = message.split(':')?.[0]
  let errorMessage = message

  if (errorCode && ERROR_MESSAGES[errorCode]) {
    errorMessage = ERROR_MESSAGES[errorCode](strings)
  }

  return errorMessage
}
