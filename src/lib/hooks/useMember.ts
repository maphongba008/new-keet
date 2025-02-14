// https://github.com/holepunchto/keet-desktop/blob/main/src/components/member/hooks.js
import { useEffect, useMemo } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import { createSelector } from '@reduxjs/toolkit'
import _isEmpty from 'lodash/isEmpty'

import {
  calcProfileColor,
  canIndex,
  canModerate,
  canWrite,
  getMemberBlockedById,
  getMemberItemById as getMemberDataById,
  memberSubscribeCmd,
  memberUnsubscribeCmd,
} from '@holepunchto/keet-store/store/member'
import { getMemberItemById } from '@holepunchto/keet-store/store/member-list'

import { getTheme } from 'component/theme'
import type { MemberType } from 'lib/types'

import { getStrings } from 'i18n/strings'

import { useDeepEqualSelector } from './useDeepEqualSelector'

export const getMemberThemeByCapability = (member: any) => {
  const theme = getTheme()

  if (canIndex(member?.capabilities) && canModerate(member?.capabilities)) {
    return {
      color: theme.memberTypes.admin,
    }
  }
  if (canModerate(member?.capabilities)) {
    return {
      color: theme.memberTypes.mod,
    }
  }
  return undefined
}

type MemberInputData = { member: any; blocked: boolean }
export const normalize = ({
  member,
  blocked,
}: MemberInputData): MemberType => ({
  id: member?.memberId,
  name: member?.name,
  displayName: member?.displayName,
  avatarUrl: member?.avatarUrl,
  color: calcProfileColor(member?.memberId),
  canModerate: canModerate(member?.capabilities),
  canIndex: canIndex(member?.capabilities),
  canWrite: canWrite(member?.capabilities),
  capabilities: member?.capabilities,
  isAnonymous: !!member?.anonymous,
  swarmId: member?.swarmId,
  isLocal: !!member?.local,
  blocked,
  isAdmin: canIndex(member?.capabilities) && canModerate(member?.capabilities),
  // TODO:
  isConnected: false,
  inCall: false,
  isVideoMuted: false,
  isAudioMuted: false,
  isSpeaking: false,
  theme: getMemberThemeByCapability(member),
})

export const getMemberByRoomId = (roomId: string, memberId: string) =>
  createSelector(
    [
      getMemberDataById(roomId, memberId),
      (state: unknown) => getMemberBlockedById(state, roomId, memberId),
    ],
    (member: MemberType, blocked: boolean) => {
      return normalize({
        member,
        blocked,
      })
    },
  )

// Use it in RoomParticipantItem as we no longer need to subscribe to Core Api memberQuery events
export function useMemberItem(roomId: string, memberId: string) {
  const member = useSelector(getMemberItemById(memberId), shallowEqual)
  const blocked = useSelector(
    (state) => getMemberBlockedById(state, roomId, memberId),
    shallowEqual,
  )
  const memberData = normalize({
    member,
    blocked,
  })

  return {
    member: memberData,
  }
}

// In RoomParticipants, subscribeMembers returns profileData, so can use item as initial values while
export function useMember(
  roomId: string,
  memberId: string,
): { member: MemberType } {
  const dispatch = useDispatch()
  useEffect(() => {
    if (!memberId) {
      return
    }
    dispatch(memberSubscribeCmd({ roomId, memberId }))
    return () => {
      dispatch(memberUnsubscribeCmd({ roomId, memberId }))
    }
  }, [roomId, memberId, dispatch])

  const blocked = useSelector(
    (state) => getMemberBlockedById(state, roomId, memberId),
    shallowEqual,
  )

  const member = useDeepEqualSelector(getMemberDataById(roomId, memberId))
  const memberData = useMemo(
    () =>
      normalize({
        member: _isEmpty(member) ? {} : member,
        blocked,
      }),
    [member, blocked],
  )

  return {
    member: memberData,
  }
}

export function getMemberName(member: Partial<MemberType>) {
  const strings = getStrings()
  if (member?.isLocal) {
    return strings.chat.you
  }
  return member?.displayName || ''
}

export function getMemberBlocked(member?: MemberType) {
  return member?.blocked ?? false
}

export function getMemberRoleName(member?: MemberType) {
  const { canIndex: canMemberIndex, canModerate: canMemberModerate } =
    member || {}
  const strings = getStrings()
  if (canMemberIndex) return strings.room.inviteType.admin
  if (canMemberModerate) return strings.room.inviteType.moderator
  return strings.room.inviteType.peer
}
