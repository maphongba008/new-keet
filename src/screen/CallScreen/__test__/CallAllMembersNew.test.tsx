import { screen } from '@testing-library/react-native'

import { getState } from 'lib/store'
import { renderWithProviders } from 'lib/testUtils'

import { preloadedStateWithTwoVideo, roomId } from './preloadedState'
import { getCallMembersData } from '../Call.helpers'
import CallAllMembersNew from '../CallAllMembersNew'

jest.mock('lib/hooks/useMember', () => ({
  useMember: jest.fn().mockImplementation((_, memberId) => ({
    member: {
      avatarUrl: memberId,
      displayName: memberId,
    },
  })),
}))

describe('Test CallAllMembersNew Component', () => {
  it('Check if component renders correctly', () => {
    const element = <CallAllMembersNew roomId={roomId} />
    const initialState = { preloadedState: preloadedStateWithTwoVideo }
    renderWithProviders(element, initialState)
  })

  it('Check if member name and avatar renders', async () => {
    const element = <CallAllMembersNew roomId={roomId} />
    const initialState = { preloadedState: preloadedStateWithTwoVideo }
    renderWithProviders(element, initialState)
    const callMemberData = getCallMembersData(getState())
    const imagesTestIds = screen.getAllByTestId('avatar_image')
    imagesTestIds.forEach((imageTestId) => {
      expect(callMemberData.ids).toContain(imageTestId.props.source.uri)
    })
    callMemberData.ids.forEach((memberId) => {
      expect(screen.getByText(memberId)).toBeTruthy()
    })
  })
})
