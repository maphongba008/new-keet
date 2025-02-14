import { renderHook, waitFor } from '@testing-library/react-native'

import {
  AutoLockTime,
  MessageType,
  usePasscodeStore,
} from 'screen/Passcode/usePasscodeStore'

describe('usePasscodeStore', () => {
  it('should set the auto lock time', async () => {
    const { result } = renderHook(() => usePasscodeStore())
    // Use waitFor to trigger the state update
    await waitFor(() => {
      result.current.setAutoLockTime(AutoLockTime.FiveMinutes)
    })
    expect(result.current.autoLockTime).toBe(AutoLockTime.FiveMinutes)
  })

  it('should set userHasPasscode', async () => {
    const { result } = renderHook(() => usePasscodeStore())
    // Set userHasPasscode to true
    await waitFor(() => {
      result.current.setUserHasPasscode(true)
    })
    expect(result.current.userHasPasscode).toBe(true)
    // Set userHasPasscode to false
    await waitFor(() => {
      result.current.setUserHasPasscode(false)
    })
    expect(result.current.userHasPasscode).toBe(false)
  })

  it('should set a message and messageType', async () => {
    const { result } = renderHook(() => usePasscodeStore())
    // Set message and messageType
    await waitFor(() => {
      result.current.setMessage('Passcode is correct')
      result.current.setMessageType(MessageType.Success)
    })
    expect(result.current.message).toBe('Passcode is correct')
    expect(result.current.messageType).toBe(MessageType.Success)
  })

  it('should reset the message and messageType', async () => {
    const { result } = renderHook(() => usePasscodeStore())
    // Set the message and messageType first
    await waitFor(() => {
      result.current.setMessage('Error occurred')
      result.current.setMessageType(MessageType.Error)
    })
    expect(result.current.message).toBe('Error occurred')
    expect(result.current.messageType).toBe(MessageType.Error)
    // Now reset the message and messageType
    await waitFor(() => {
      result.current.resetMessage()
    })
    expect(result.current.message).toBe('')
    expect(result.current.messageType).toBeNull()
  })
})
