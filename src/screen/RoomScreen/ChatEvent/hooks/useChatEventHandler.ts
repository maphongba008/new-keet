import { useCallback } from 'react'

import { useAppNavigation } from 'lib/hooks/useAppNavigation'
import { getRoomTypeFlags } from 'lib/hooks/useRoom'
import { SCREEN_USER_PROFILE } from 'lib/navigation'
import { MemberType, ReactionsType } from 'lib/types.js'

import useOnLongPressMessage from '../../ChatEvents/hooks/useOnLongPressMessage'

export interface MemberByRoomI {
  [memberId: string]: MemberType
}

interface Props {
  messageId: string
  roomId: string
  memberId: string
  roomType: string
  reactions: ReactionsType
}

export const useChatEventHandler = ({
  messageId,
  roomId,
  memberId,
  roomType,
  reactions,
}: Props) => {
  const navigation = useAppNavigation()
  const { isChannel } = getRoomTypeFlags(roomType)

  const onPressAvatar = useCallback(() => {
    if (!isChannel) {
      navigation.navigate(SCREEN_USER_PROFILE, { memberId, roomId })
    }
  }, [navigation, memberId, roomId, isChannel])

  const onLongPress = useOnLongPressMessage({
    roomId,
    messageId,
    inappropriateMessage:
      reactions.inappropriateMessage || reactions.mineInappropriateReported,
    roomType,
  })

  return {
    onPressAvatar,
    onLongPress,
    isChannel,
  }
}
