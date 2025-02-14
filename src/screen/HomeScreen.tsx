import React from 'react'

import UpdateVersion from 'component/UpdateVersion'

import { RoomList } from './LobbyScreen/RoomList'

export const HomeScreen = () => {
  return (
    <>
      <RoomList />
      <UpdateVersion />
    </>
  )
}

export default HomeScreen
