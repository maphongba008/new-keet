import { getUploadsDir } from '../getUploadsDir'

jest.mock('expo-file-system', () => ({
  cacheDirectory: 'cache-directory/',
}))

describe('getUploadsDir', () => {
  it('should generate the correct uploads URI', () => {
    const result = getUploadsDir()

    expect(result).toBe(`cache-directory/uploads/`)
  })
})
