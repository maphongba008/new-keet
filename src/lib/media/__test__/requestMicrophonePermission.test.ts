import { Camera } from 'expo-camera'

import { requestMicrophonePermission } from '../requestMicrophonePermission'

jest.mock('expo-camera', () => ({
  Camera: {
    requestMicrophonePermissionsAsync: jest.fn(),
  },
}))

describe('requestMicrophonePermission', () => {
  it('should return true when permission is granted', async () => {
    ;(Camera.requestMicrophonePermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    })

    const result = await requestMicrophonePermission()
    expect(result).toBe(true)
  })

  it('should return false when permission is denied', async () => {
    ;(Camera.requestMicrophonePermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    })

    const result = await requestMicrophonePermission()
    expect(result).toBe(false)
  })

  it('should return false when an error occurs', async () => {
    ;(Camera.requestMicrophonePermissionsAsync as jest.Mock).mockRejectedValue(
      new Error('Permission error'),
    )

    const result = await requestMicrophonePermission()
    expect(result).toBe(false)
  })
})
