import React from 'react'
import { render } from '@testing-library/react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import PasscodeCheckScreen from 'screen/Passcode/PasscodeCheckScreen'

describe('PasscodeCheckScreen Snapshot', () => {
  it('should match the snapshot with default props', () => {
    const { toJSON } = render(
      <SafeAreaProvider>
        <PasscodeCheckScreen />
      </SafeAreaProvider>,
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('should match the snapshot with a back button and close button', () => {
    const { toJSON } = render(
      <SafeAreaProvider>
        <PasscodeCheckScreen hasBackButton={true} hasCloseButton={true} />
      </SafeAreaProvider>,
    )
    expect(toJSON()).toMatchSnapshot()
  })

  it('should match the snapshot when onSuccess callback is passed', () => {
    const { toJSON } = render(
      <SafeAreaProvider>
        <PasscodeCheckScreen onSuccess={jest.fn()} />
      </SafeAreaProvider>,
    )
    expect(toJSON()).toMatchSnapshot()
  })
})
