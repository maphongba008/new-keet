import { PERMISSIONS } from '@holepunchto/keet-store/store/media/media-constraints'

import { getScreenSharePermission } from '../getScreenSharePermission'

describe('getScreenSharePermission', () => {
  it('should return PERMISSIONS.UNSUPPORTED', async () => {
    const result = await getScreenSharePermission()
    expect(result).toBe(PERMISSIONS.UNSUPPORTED)
  })
})
