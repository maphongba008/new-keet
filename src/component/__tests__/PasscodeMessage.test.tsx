import React from 'react'
import { render } from '@testing-library/react-native'

import PasscodeMessage from 'screen/Passcode/PasscodeMessage'
import { MessageType } from 'screen/Passcode/usePasscodeStore'

describe('PasscodeMessage Snapshot', () => {
  it('should match the snapshot with a success message', () => {
    const { toJSON } = render(
      <PasscodeMessage
        message="Passcode correct"
        messageType={MessageType.Success}
      />,
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('should match the snapshot with an error message', () => {
    const { toJSON } = render(
      <PasscodeMessage
        message="Passcode incorrect"
        messageType={MessageType.Error}
      />,
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('should match the snapshot with no message', () => {
    const { toJSON } = render(<PasscodeMessage message="" messageType={null} />)
    expect(toJSON()).toMatchSnapshot()
  })
})
