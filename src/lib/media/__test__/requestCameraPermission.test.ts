import { Camera } from 'expo-camera' // Adjust the import according to your project structure

import { requestCameraPermission } from '../requestCameraPermission'

jest.mock('expo-camera', () => ({
  Camera: {
    requestCameraPermissionsAsync: jest.fn(),
  },
}))

describe('requestCameraPermission', () => {
  it('should return true when permission is granted', async () => {
    ;(Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: true,
    })

    const result = await requestCameraPermission()
    expect(result).toBe(true)
  })

  it('should return false when permission is denied', async () => {
    ;(Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    })

    const result = await requestCameraPermission()
    expect(result).toBe(false)
  })

  it('should return false when an error occurs', async () => {
    ;(Camera.requestCameraPermissionsAsync as jest.Mock).mockRejectedValue(
      new Error('Permission error'),
    )

    const result = await requestCameraPermission()
    expect(result).toBe(false)
  })
})
