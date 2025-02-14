// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/room-invite/hooks.js
import { calculateExpiryDateAndFormat } from 'lib/date'

import { Strings } from 'i18n/strings'

import { CAPABILITIES } from '../constants'

const getRoleName = (strings: Strings, invitationType: number) => {
  switch (invitationType) {
    case CAPABILITIES.CAN_MODERATE:
      return strings.room.asAModerator
    case CAPABILITIES.CAN_INDEX:
      return strings.room.asAnAdmin
    default:
      return strings.room.asAPeer
  }
}

const formatRoomTitle = (roomTitle: string) => roomTitle.trim()

const getExpiryDate = (expireDuration: string) =>
  calculateExpiryDateAndFormat(expireDuration)

export const getInvitationShareTitle = (
  strings: Strings,
  roomTitle: string,
  invitationType = CAPABILITIES.CAN_WRITE,
) => {
  const trimmedRoomTitle = formatRoomTitle(roomTitle)
  const roleName = getRoleName(strings, invitationType)
  return `${strings.room.youveBeenInvitedToJoin}${trimmedRoomTitle} ${roleName}.`
}

export const getInvitationShareBody = (
  strings: any,
  expireDuration: string,
  invitation?: string,
) => {
  let invitationText
  let bodyMessage: string

  if (invitation) {
    bodyMessage = `
${strings.room.toConnectPasteLink}

${invitation}

${strings.room.seeYouThere}`
  } else {
    bodyMessage = `
${strings.room.seeYouThere}`
  }

  // Handle expiry information
  if (expireDuration === '0') {
    invitationText = `${bodyMessage} ${strings.room.inviteDoesNotExpire}`
  } else {
    const expiryDate = getExpiryDate(expireDuration)
    invitationText = `${bodyMessage} ${strings.room.inviteExpiresAt} ${expiryDate}.`
  }
  return invitationText
}

export const getInvitationShareText = (
  strings: any,
  roomTitle: string,
  expireDuration: string,
  invitation?: string,
  invitationType = CAPABILITIES.CAN_WRITE,
) => {
  const introMessage = getInvitationShareTitle(
    strings,
    roomTitle,
    invitationType,
  )
  const invitationText = getInvitationShareBody(
    strings,
    expireDuration,
    invitation,
  )

  return `${introMessage}\n${invitationText}`
}
