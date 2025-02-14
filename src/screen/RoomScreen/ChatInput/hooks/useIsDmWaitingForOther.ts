import { useSelector } from 'react-redux'

import { getRoomMemberCount } from '@holepunchto/keet-store/store/room'

import { getRoomTypeFlags, useRoom } from 'lib/hooks/useRoom'

export const useIsDmWaitingForOther = (roomId: string) => {
  const count: number = useSelector(getRoomMemberCount(roomId)) || 0
  const { isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)
  return isDm && count < 2
}
