import React from 'react'
import { useSelector } from 'react-redux'
import _get from 'lodash/get'

import {
  getRoomAllPairing,
  getRoomMainId,
} from '@holepunchto/keet-store/store/room'

import RoomBackground from 'component/RoomBackground'

function WithRoomIdRendered<P extends object>(
  Component: React.ComponentType<P>,
) {
  const WrappedComponent: React.FC<any> = (props) => {
    const { data } = _get(props, 'route.params', {})

    const roomId = useSelector(getRoomMainId)

    const isRoomPairing: boolean = useSelector((state) => {
      if (data) {
        return getRoomAllPairing(state)?.some(
          ({ discoveryId }) => discoveryId === data,
        )
      }

      return false
    })

    if (!isRoomPairing && !roomId) return <RoomBackground />

    return (
      <Component
        key={roomId}
        {...props}
        roomId={roomId}
        isRoomPairing={isRoomPairing}
      />
    )
  }
  return WrappedComponent
}

export default WithRoomIdRendered
