import { Camera } from 'expo-camera'

import { PERMISSIONS } from '@holepunchto/keet-store/store/media/media-constraints'

import { getCameraPermission } from '../getCameraPermission'

jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
  },
}))

describe('getCameraPermission', () => {
  it('should return the permission status when permission is granted', async () => {
    const mockPermission = { status: 'granted' }
    ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue(
      mockPermission,
    )

    const result = await getCameraPermission()
    expect(result).toBe(mockPermission.status)
  })

  it('should return PERMISSIONS.UNKNOWN when an error occurs', async () => {
    ;(Camera.getCameraPermissionsAsync as jest.Mock).mockRejectedValue(
      new Error('Permission error'),
    )

    const result = await getCameraPermission()
    expect(result).toBe(PERMISSIONS.UNKNOWN)
  })
})
