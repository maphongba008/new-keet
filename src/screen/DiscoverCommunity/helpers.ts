import { ImageSourcePropType } from 'react-native'

import keet_community_rooms from './keet_community_rooms'

export interface CommunityRoomDetails {
  discoveryId: string
  title: string
  avatarUrl: ImageSourcePropType
  description: string
  inviteUrl: string
  peersCount?: number
  contactCount?: number
}

interface DiscoverCommunityType {
  [key: string]: CommunityRoomDetails
}

export const SHOW_SEARCH = false

export const getDiscoveryRoomInvites = (selectedRoom: string[]) => {
  const allRoomsDetails = keet_community_rooms as DiscoverCommunityType
  const allRoomUrls = Object.keys(allRoomsDetails)
  const roomDetails = selectedRoom.length > 0 ? selectedRoom : allRoomUrls
  return roomDetails.reduce((acc: string[], id: string | number) => {
    if (!allRoomsDetails[id]) {
      return acc
    }
    acc.push(allRoomsDetails[id].inviteUrl)
    return acc
  }, []) as string[]
}
