// desktop equivalent https://github.com/holepunchto/keet-desktop/blob/main/src/components/room/hooks.js
import { useCallback, useEffect, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import { useFocusEffect } from '@react-navigation/native'
import { createSelector } from '@reduxjs/toolkit'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import { getChatMessageIds } from '@holepunchto/keet-store/store/chat'
import { updateFileEntry } from '@holepunchto/keet-store/store/media/file'
import {
  canIndex,
  canModerate,
  canWrite,
  getMembersByRoomIdState,
  getMyMember,
  getMyMemberId,
} from '@holepunchto/keet-store/store/member'
import {
  getRoomConfigWithMyCapabilities,
  getRoomItemById,
} from '@holepunchto/keet-store/store/room'
import { ROOM_TYPE } from '@holepunchto/keet-store/store/room/room.constants'

import { useFileId } from 'screen/RoomScreen/hooks/useFileId'
import { useUpdateClearedFile } from 'screen/RoomScreen/hooks/useUpdateClearedFile'
import { navigate, SCREEN_ROOM } from 'lib/navigation'
import { resetRoomID } from 'lib/room'
import { getState } from 'lib/store'
import { MemberType } from 'lib/types'

import { useDeepEqualSelector } from './useDeepEqualSelector'

const NAVIGATE_ROOM_TIMEOUT = 700
export const ROOM_AVATAR_UPLOAD_KEY = 'room-avatar'
export const ROOM_AVATAR_PATH_PREFIX = 'room-avatar-'

export type ConfigType = {
  roomType: string
  title: string
  description: string
  avatar: { driveId: string; path: string; version: number } | null
  canCall: boolean
  canPost: boolean
  canWrite: boolean
  canIndex: boolean
  isCallEnabled: boolean
  experimental: boolean
  version: number
  myCapabilites?: number
}

export const useConfig = (roomId: string) => {
  const roomconfig = useDeepEqualSelector(
    getRoomConfigWithMyCapabilities(roomId),
  )

  return roomconfig
}

export const useRoomAvatar = (roomId: string): string | null => {
  const config: any = useDeepEqualSelector(getRoomItemById(roomId))
  const avatarUrl = config?.avatarUrl
  const avatarUrlCleared = config?.avatarUrlCleared

  const {
    driveId,
    path,
    version,
  }: { driveId: string; path: string; version: number } = config?.avatar
    ? JSON.parse(config?.avatar)
    : {}

  const updateClearedFile = useUpdateClearedFile()
  const fileId = useFileId({ driveId, path, version })
  const dispatch = useDispatch()
  useEffect(() => {
    if (!avatarUrl || !fileId) {
      return
    }
    if (avatarUrlCleared) {
      dispatch(
        updateFileEntry({
          id: fileId,
          driveId,
          path,
          version,
        }),
      )
      updateClearedFile(fileId, false)
    }
  }, [
    avatarUrl,
    avatarUrlCleared,
    dispatch,
    driveId,
    fileId,
    path,
    updateClearedFile,
    version,
  ])

  return avatarUrl
}

export const useMembership = (roomId: string) => {
  const myMemberId = useSelector(getMyMemberId(roomId), shallowEqual)
  const myMember: { capabilities: number } = useDeepEqualSelector(
    getMyMember(roomId),
  )
  const capabilities = myMember?.capabilities

  return {
    memberId: myMemberId || '',
    canModerate: canModerate(capabilities),
    canWrite: canWrite(capabilities),
    canIndex: canIndex(capabilities),
    capabilities,
  }
}

export const useCanModerate = (roomId: string) => {
  const myMemberId: string = useSelector(getMyMemberId(roomId))
  const myMember = useSelector(
    (state) => getMembersByRoomIdState(roomId)(state).byMemberId[myMemberId],
    isEqual,
  )
  return canModerate(myMember?.capabilities)
}

export const useRoomSearchCount = (roomsCount: number) => {
  const roomRenders = useRef<Record<string, boolean>>({})
  const [hasSearchEmpty, setHasSearchEmpty] = useState(false)
  const currentHasSearchEmpty = useRef(hasSearchEmpty)

  const addRoomFound = useCallback(
    (roomId: string, isHidden: boolean) => {
      roomRenders.current[roomId] = isHidden

      if (roomsCount === Object.values(roomRenders.current).length) {
        const nextHasSearchEmpty = Object.values(roomRenders.current).every(
          (value) => value,
        )
        if (nextHasSearchEmpty !== currentHasSearchEmpty.current) {
          currentHasSearchEmpty.current = nextHasSearchEmpty
          setHasSearchEmpty(nextHasSearchEmpty)
        }
      }
    },
    [roomsCount],
  )

  return {
    hasSearchEmpty: roomsCount === 0 ? true : hasSearchEmpty,
    addRoomFound,
  }
}

export const useTimerEffect = (
  timeout: number,
  isDependency: unknown,
  resolve: () => void,
) => {
  useEffect(() => {
    if (isDependency) {
      const timer = setTimeout(resolve, timeout)
      return () => clearTimeout(timer)
    }
  }, [isDependency, timeout, resolve])
}

/**
 * Reset room ID so that in lobby it shows "$1 has new messages" for new messages in a room,
 * if we no reset and still subscribed to that room, there won't be toast coming in (since it is treated as user still in that room)
 *
 * Issue arise for RoomInvitation.tsx's useInvitation uses a roomID, and with react-navigation on pop screen it takes awhile for a room to do cleanup.
 * Meaning if user spam back btn from RoomInvitation.tsx (uses room id) -> RoomScreen.tsx -> RoomList.tsx (reset room id), it'll show 'Could not create invitation link'
 * https://app.asana.com/0/1204361817407975/1205707998755903/f
 *
 * Here we put a delay in resetting room, and reset ONLY when user is not navigating to another room (registering another room id) by utilising useUnloading
 * useNavigated instead of useNavigating because if user halfway swiping back but changes his mind, useNavigating will still get triggered
 */
export const useLobbyResetRoomId = () => {
  useFocusEffect(
    useCallback(() => {
      resetRoomID()
    }, []),
  )
}

export const useIsCallEnabled = (roomId: string) => {
  const roomConfig: any =
    useSelector(getRoomItemById(roomId), shallowEqual) || {}
  return roomConfig.canCall === 'true'
}

export const getIsPinMessageEnabled = (roomId: string) =>
  createSelector(
    getRoomItemById(roomId),
    (roomConfig) => roomConfig?.version >= 2,
  )

// We wait for getChatMessageIds to return data https://github.com/holepunchto/keet-mobile/pull/2404#technical-detail
export const useNavigateToRoom = () => {
  const navigateTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const messageIds: Array<string> = useDeepEqualSelector(getChatMessageIds)
  const pendingRoomIdRef = useRef('')

  // 2. navigate when messageIds is loaded
  useEffect(() => {
    if (messageIds.length > 0 && pendingRoomIdRef.current) {
      navigateTimeoutRef.current && clearTimeout(navigateTimeoutRef.current)
      pendingRoomIdRef.current = ''
      navigate(SCREEN_ROOM)
    }
  }, [messageIds])

  // 3. cleanup
  useEffect(() => {
    return () => {
      navigateTimeoutRef.current && clearTimeout(navigateTimeoutRef.current)
    }
  }, [])

  // 1. Initiate navigation, either until messageIds returns or 700ms
  const initiateRoomNavigation = useCallback((roomId: string) => {
    pendingRoomIdRef.current = roomId
    navigateTimeoutRef.current = setTimeout(() => {
      if (roomId !== getAppCurrentRoomId(getState())) return
      pendingRoomIdRef.current = ''
      navigate(SCREEN_ROOM)
    }, NAVIGATE_ROOM_TIMEOUT)
  }, [])

  return initiateRoomNavigation
}

export const getRoomTypeFlags = (roomType: string | undefined) =>
  roomType
    ? {
        isChannel: roomType === ROOM_TYPE.BROADCAST,
        isDm: roomType === ROOM_TYPE.DM,
      }
    : {
        isChannel: false,
        isDm: false,
      }

export const normalizeMeInDmRoom = (member: MemberType, isDm: boolean) => {
  if (!member?.isLocal || !isDm) {
    return member
  }
  return {
    ...member,
    // to hide Admin/Mod tag but keep showing You tag
    isAdmin: false,
    canModerate: false,
  }
}

export const useRoom = (roomId: string) => {
  return useSelector(getRoomItemById(roomId), isEqual)
}
