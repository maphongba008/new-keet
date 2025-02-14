import React from 'react'
import { screen } from '@testing-library/react-native'

import { getCallState } from '@holepunchto/keet-store/store/call'
import {
  createByRoomIdInitialData,
  MEMBER_STATE_KEY,
} from '@holepunchto/keet-store/store/member'

import { renderWithProviders } from 'lib/testUtils'

import CallFirstFourMember from '../CallFirstFourMember'

jest.mock('@holepunchto/keet-store/store/call', () => ({
  ...jest.requireActual('@holepunchto/keet-store/store/call'),
  getCallState: jest.fn(),
}))

jest.mock('@holepunchto/keet-store/api/rooms', () => ({
  ...jest.requireActual('@holepunchto/keet-store/api/rooms'),
  useSubscribeMemberQuery: jest.fn(),
}))

const getCallStateMock = getCallState as jest.Mock

const getInitialState = (roomId: string, members?: any[]) => {
  const initialState = {
    [MEMBER_STATE_KEY]: {
      byRoomId: {
        [roomId]: createByRoomIdInitialData(),
      },
      blockedMembersByRoomId: {},
    },
  }
  if (!members) {
    return initialState
  }
  members.forEach((member) => {
    initialState[MEMBER_STATE_KEY].byRoomId[roomId].byMemberId[
      member.memberId
    ] = member
  })
  return initialState
}

describe('CallFirstFourMember component tests', () => {
  const ROOM_ID = 'room-1'
  const MEMBER_ID_1 = '1'
  const MEMBER_ID_2 = '2'
  const MEMBER_ID_3 = '3'
  it('renders 1 CallMember', () => {
    getCallStateMock.mockReturnValue({
      memberId: MEMBER_ID_1,
      presenceMemberSwarmIds: [],
    })
    const element = <CallFirstFourMember roomId={ROOM_ID} />
    renderWithProviders(element, { preloadedState: getInitialState(ROOM_ID) })
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders 2 CallMembers', () => {
    getCallStateMock.mockReturnValue({
      memberId: MEMBER_ID_1,
      presenceMemberSwarmIds: [MEMBER_ID_2],
      mediaBySwarmId: [{}],
      presenceBySwarmId: [{}],
    })
    const preloadedState = getInitialState(ROOM_ID, [
      { memberId: MEMBER_ID_1 },
      { memberId: MEMBER_ID_2, displayName: 'name_2' },
    ])
    const element = <CallFirstFourMember roomId={ROOM_ID} />
    renderWithProviders(element, { preloadedState })
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('renders 3 CallMembers', () => {
    getCallStateMock.mockReturnValue({
      memberId: MEMBER_ID_1,
      presenceMemberSwarmIds: [MEMBER_ID_2, MEMBER_ID_3],
      mediaBySwarmId: [{}],
      presenceBySwarmId: [{}],
    })
    const preloadedState = getInitialState(ROOM_ID, [
      { memberId: MEMBER_ID_1 },
      { memberId: MEMBER_ID_2, displayName: 'name_2' },
      { memberId: MEMBER_ID_3, displayName: 'name_3' },
    ])
    const element = <CallFirstFourMember roomId={ROOM_ID} />
    renderWithProviders(element, { preloadedState })
    expect(screen.toJSON()).toMatchSnapshot()
  })
})
