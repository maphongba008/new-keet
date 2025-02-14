import { useCallback, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { randomUUID } from 'expo-crypto'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  FILE_PREVIEW_NAME_PREFIX,
  FILE_PREVIEW_SIZE_LARGE,
} from '@holepunchto/keet-store/store/media/file'

import { CAPABILITIES, INVITE_DURATION } from 'lib/constants'

import { useStrings } from 'i18n/strings'

import {
  getInvitationShareBody,
  getInvitationShareTitle,
} from './useInvitation'
import { useConfig, useRoomAvatar } from './useRoom'

interface useGetInvitationPreviewI {
  invitationType?: number
  duration?: string
}
export function useGetInvitationPreview({
  invitationType = CAPABILITIES.CAN_WRITE,
  duration = INVITE_DURATION.WEEKS,
}: useGetInvitationPreviewI) {
  const strings = useStrings()
  const roomId = useSelector(getAppCurrentRoomId)

  const { title }: { title: string } = useConfig(roomId)
  const avatarUrl = useRoomAvatar(roomId)

  const isPermanentInvitation = duration === '0'

  const invitationPreviewTitle = useMemo(() => {
    return getInvitationShareTitle(strings, title, invitationType)
  }, [invitationType, strings, title])

  const invitationPreviewBody = useMemo(() => {
    const durationText = isPermanentInvitation ? '0' : duration
    return getInvitationShareBody(strings, durationText, '')
  }, [duration, isPermanentInvitation, strings])

  const getInvitationPreview = useCallback(async () => {
    const jpegImage: any = avatarUrl
      ? await manipulateAsync(
          avatarUrl,
          [
            {
              resize: {
                width: FILE_PREVIEW_SIZE_LARGE,
                height: FILE_PREVIEW_SIZE_LARGE,
              },
            },
          ],
          {
            compress: 1,
            format: SaveFormat.JPEG,
          },
        )
      : {}
    const invitationPreview = jpegImage?.uri
      ? {
          preview: jpegImage.uri.replace('file://', ''),
          dimensions: {
            height: FILE_PREVIEW_SIZE_LARGE,
            width: FILE_PREVIEW_SIZE_LARGE,
          },
          name: `${FILE_PREVIEW_NAME_PREFIX}${randomUUID()}.${SaveFormat.JPEG}`,
          isLocalUri: true,
        }
      : {}

    return {
      ...invitationPreview,
      title: invitationPreviewTitle,
      description: invitationPreviewBody,
    }
  }, [avatarUrl, invitationPreviewBody, invitationPreviewTitle])

  return getInvitationPreview
}
