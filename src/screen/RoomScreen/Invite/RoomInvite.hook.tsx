import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import * as Clipboard from 'expo-clipboard'
import RNQRGenerator from 'rn-qr-generator'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  clearRoomInvitation,
  createRoomInvitation,
  getRoomInvitation,
  ROOM_TYPE,
} from '@holepunchto/keet-store/store/room'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { CAPABILITIES, INVITE_DURATION } from 'lib/constants'
import { useGetInvitationPreview } from 'lib/hooks/useGetInvitationPreview'
import { getInvitationShareText } from 'lib/hooks/useInvitation'
import { getRoomTypeFlags, useConfig, useMembership } from 'lib/hooks/useRoom'
import { showErrorNotifier, showInfoNotifier } from 'lib/hud'

import { useStrings } from 'i18n/strings'

const QR_SIZE = 270

export function useRoomInvite() {
  const strings = useStrings()
  const dispatch = useDispatch()
  const invitation = useSelector(getRoomInvitation)
  const [invitationType, setInvitationType] = useState(CAPABILITIES.CAN_WRITE)
  const roomId = useSelector(getAppCurrentRoomId)
  const { title, roomType }: { title: string; roomType: string } =
    useConfig(roomId)
  const { canModerate, canIndex } = useMembership(roomId)
  const [qrUri, setQrUri] = useState<string | null>(null)

  const [areAdminRulesAccepted, setAreAdminRulesAccepted] =
    useState<boolean>(false)

  const { isChannel } = getRoomTypeFlags(roomType)

  const [duration, setDuration] = useState<string>(
    isChannel ? '0' : INVITE_DURATION.WEEKS,
  )

  const isPermanentInvitation = duration === '0'

  const onPressInviteInfo = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.RoomInviteType,
    })
  }, [])

  const isPermalinkAllowed = useCallback(
    (it = invitationType) =>
      roomType === ROOM_TYPE.BROADCAST && it === CAPABILITIES.CAN_WRITE,
    [invitationType, roomType],
  )

  const allowPermalink = isPermalinkAllowed()

  const adjustExpiry = useCallback(
    (nextInvitationType: number) => {
      if (isPermalinkAllowed(nextInvitationType) && !allowPermalink) {
        if (duration === INVITE_DURATION.WEEKS)
          setDuration(INVITE_DURATION.PERMANENT)
        if (duration === INVITE_DURATION.HOURS)
          setDuration(INVITE_DURATION.DAYS)
      }
      if (!isPermalinkAllowed(nextInvitationType) && allowPermalink) {
        if (duration === INVITE_DURATION.PERMANENT)
          setDuration(INVITE_DURATION.WEEKS)
        if (duration === INVITE_DURATION.DAYS)
          setDuration(INVITE_DURATION.HOURS)
      }
    },
    [allowPermalink, duration, isPermalinkAllowed],
  )

  const onTypeChange = useCallback(
    (type: number) => {
      adjustExpiry(type)
      setInvitationType(type)
      setAreAdminRulesAccepted(false)
      dispatch(clearRoomInvitation())
    },
    [adjustExpiry, dispatch],
  )

  const onPressInviteTypeOptions = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.InviteTypeOptionsSheet,
      setInvitationType: onTypeChange,
      canModerate,
      canIndex,
    })
  }, [canIndex, canModerate, onTypeChange])

  const getInvitationPreview = useGetInvitationPreview({
    invitationType,
    duration,
  })

  const generateInvitation = useCallback(async () => {
    const invitationPreview = await getInvitationPreview()
    dispatch(
      createRoomInvitation({
        roomId,
        isPublic: false,
        invitationPreview,
        opts: {
          canModerate: invitationType !== CAPABILITIES.CAN_WRITE,
          canIndex: invitationType === CAPABILITIES.CAN_INDEX,
          expiration: isPermanentInvitation ? 0 : duration,
          reusable: true,
        },
      }),
    )
  }, [
    dispatch,
    duration,
    getInvitationPreview,
    invitationType,
    isPermanentInvitation,
    roomId,
  ])

  const textToShare = useMemo(() => {
    const durationText = isPermanentInvitation ? '0' : duration
    return getInvitationShareText(
      strings,
      title,
      durationText,
      undefined,
      invitationType,
    )
  }, [duration, invitationType, isPermanentInvitation, strings, title])

  const onCopy = useCallback(() => {
    Clipboard.setStringAsync(invitation)
    showInfoNotifier(strings.downloads.textCopied)
  }, [invitation, strings])

  const selectedInvitationTypeText = useMemo(() => {
    switch (invitationType) {
      case CAPABILITIES.CAN_WRITE:
        return strings.room.inviteType.peer
      case CAPABILITIES.CAN_MODERATE:
        return strings.room.inviteType.moderator
      case CAPABILITIES.CAN_INDEX:
        return strings.room.inviteType.admin
      default:
        return strings.room.inviteType.peer
    }
  }, [invitationType, strings.room.inviteType])

  useEffect(
    () => () => {
      dispatch(clearRoomInvitation())
    },
    [dispatch],
  )

  useEffect(() => {
    if (invitation) {
      RNQRGenerator.generate({
        value: invitation,
        width: QR_SIZE,
        height: QR_SIZE,
        correctionLevel: 'H',
      })
        .then(({ uri }) => {
          if (!uri) {
            throw new Error('')
          }
          setQrUri(uri)
        })
        .catch((err) => {
          console.log(err)
          showErrorNotifier(strings.room.qrError)
        })
    }
  }, [invitation, strings.room.qrError])

  const isAdminSelected = invitationType === CAPABILITIES.CAN_INDEX
  const isModeratorSelected = invitationType === CAPABILITIES.CAN_MODERATE

  const isPermanenetLinkFeatureEnabled =
    invitationType !== CAPABILITIES.CAN_INDEX &&
    invitationType !== CAPABILITIES.CAN_MODERATE &&
    !isChannel

  /*   useEffect(() => {
    if (isPermanentInvitation && !isPermanenetLinkFeatureEnabled) {
      setIsPermanentInvitation(false)
    }
  }, [isPermanentInvitation, isPermanenetLinkFeatureEnabled])

  useEffect(() => {
    if (isPermanenetLinkFeatureEnabled && isChannel) {
      setIsPermanentInvitation(true)
    }
  }, [isPermanenetLinkFeatureEnabled, isChannel]) */

  return {
    onPressInviteInfo,
    onPressInviteTypeOptions,
    duration,
    setDuration,
    generateInvitation,
    invitation,
    setInvitationType,
    roomName: title,
    areAdminRulesAccepted,
    setAreAdminRulesAccepted,
    onCopy,
    selectedInvitationTypeText,
    invitationType,
    isAdminSelected,
    isModeratorSelected,
    canModerate,
    canIndex,
    textToShare,
    qrUri,
    isPermanenetLinkFeatureEnabled,
    isChannel,
  }
}
