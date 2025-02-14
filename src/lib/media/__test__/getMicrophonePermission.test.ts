import { Camera } from 'expo-camera'

import { PERMISSIONS } from '@holepunchto/keet-store/store/media/media-constraints'

import { getMicrophonePermission } from '../getMicrophonePermission'

jest.mock('expo-camera', () => ({
  Camera: {
    getMicrophonePermissionsAsync: jest.fn(),
  },
}))

describe('getMicrophonePermission', () => {
  it('should return the permission status when permission is granted', async () => {
    const mockPermission = { status: 'granted' }
    ;(Camera.getMicrophonePermissionsAsync as jest.Mock).mockResolvedValue(
      mockPermission,
    )

    const result = await getMicrophonePermission()
    expect(result).toBe(mockPermission.status)
  })

  it('should return PERMISSIONS.UNKNOWN when an error occurs', async () => {
    ;(Camera.getMicrophonePermissionsAsync as jest.Mock).mockRejectedValue(
      new Error('Permission error'),
    )

    const result = await getMicrophonePermission()
    expect(result).toBe(PERMISSIONS.UNKNOWN)
  })
})
