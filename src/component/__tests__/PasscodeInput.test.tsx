import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'

import { PasscodeInput } from 'screen/Passcode'

describe('PasscodeInput Tests', () => {
  it('should match the snapshot with default props', () => {
    const { toJSON } = render(
      <PasscodeInput title="Enter Passcode" onComplete={jest.fn()} />,
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('should match the snapshot with description and biometrics enabled', () => {
    const { toJSON } = render(
      <PasscodeInput
        title="Enter Passcode"
        description="Please enter your 4-digit passcode."
        onComplete={jest.fn()}
        showBiometrics={true}
      />,
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('should match the snapshot with biometrics disabled', () => {
    const { toJSON } = render(
      <PasscodeInput
        title="Enter Passcode"
        onComplete={jest.fn()}
        showBiometrics={false}
      />,
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('should call onComplete when passcode is completed', () => {
    const onCompleteMock = jest.fn()

    render(<PasscodeInput title="Enter Passcode" onComplete={onCompleteMock} />)

    // Simulate pressing 1, 2, 3, 4
    fireEvent.press(screen.getByText('1'))
    fireEvent.press(screen.getByText('2'))
    fireEvent.press(screen.getByText('3'))
    fireEvent.press(screen.getByText('4'))

    // Assert that onComplete was called with the correct passcode
    expect(onCompleteMock).toHaveBeenCalledWith('1234')
  })
})
