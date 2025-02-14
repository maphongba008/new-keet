import { requestScreenSharePermission } from '../requestScreenSharePermission'

describe('requestScreenSharePermission', () => {
  it('should return false', async () => {
    const result = await requestScreenSharePermission()
    expect(result).toBe(false)
  })
})
