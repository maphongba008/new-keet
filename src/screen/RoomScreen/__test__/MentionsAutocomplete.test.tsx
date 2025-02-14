import React from 'react'
import { fireEvent, screen } from '@testing-library/react-native'

import { renderWithProviders } from 'lib/testUtils'

import MentionAutoComplete from '../ChatInput/MentionAutoComplete'

describe('test MentionsAutocomplete', () => {
  it('render correctly', async () => {
    const onSelectProfile = jest.fn()
    const element = (
      <MentionAutoComplete
        onSelectMentionProfile={onSelectProfile}
        profiles={[
          {
            memberId: '1',
            name: 'member 1',
            displayName: 'Member 1',
            avatarUrl: null,
          },
          {
            memberId: '2',
            name: 'member 2',
            displayName: 'Member 2',
            avatarUrl: 'base64',
            capabilities: 31, // Admin
          },
        ]}
      />
    )
    renderWithProviders(element, {
      preloadedState: {
        app: {
          currentRoomId: 'room1',
        },
        room: {
          roomById: {
            room1: {
              roomType: '1',
            },
          },
        },
        member: {
          blockedMembersByRoomId: {
            room1: { '1': true },
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
    // expect member 1 was not rendered due to blocked
    expect(screen.queryByTestId('1')).toBeFalsy()
    // click on member 2
    const item = await screen.findByTestId('2')
    fireEvent.press(item)
    expect(onSelectProfile).toHaveBeenCalledWith('Member 2')
  })

  it('For Dm room render without member role color and tag', async () => {
    const onSelectProfile = jest.fn()
    const element = (
      <MentionAutoComplete
        onSelectMentionProfile={onSelectProfile}
        profiles={[
          {
            memberId: '1',
            name: 'member 1',
            displayName: 'Member 1',
            avatarUrl: null,
          },
          {
            memberId: '2',
            name: 'member 2',
            displayName: 'Member 2',
            avatarUrl: 'base64',
          },
        ]}
      />
    )
    renderWithProviders(element, {
      preloadedState: {
        app: {
          currentRoomId: 'room1',
        },
        room: {
          roomById: {
            room1: {
              roomType: '2',
            },
          },
        },
        member: {
          blockedMembersByRoomId: {
            room1: [],
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('render null with no profiles', async () => {
    const onSelectProfile = jest.fn()
    const element = (
      <MentionAutoComplete
        onSelectMentionProfile={onSelectProfile}
        profiles={[]}
      />
    )
    renderWithProviders(element, {
      preloadedState: {
        app: {
          currentRoomId: 'room1',
        },
        room: {
          roomById: {
            room1: {
              roomType: '1',
            },
          },
        },
        member: {
          blockedMembersByRoomId: {
            room1: [],
          },
        },
      },
    })
    expect(screen.toJSON()).toMatchSnapshot()
  })
})
