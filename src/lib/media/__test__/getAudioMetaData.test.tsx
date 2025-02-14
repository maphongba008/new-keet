import { getAudioDuration } from 'lib/fileManager'

import { getAudioMetaData } from '../getAudioMetaData'

jest.mock('lib/fileManager', () => ({
  getAudioDuration: jest.fn(),
}))

describe('getAudioMetaData', () => {
  const uri = 'test-uri'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return duration when getAudioDuration resolves with a value', async () => {
    ;(getAudioDuration as jest.Mock).mockResolvedValue(120)

    const result = await getAudioMetaData(uri)

    expect(getAudioDuration).toHaveBeenCalledWith(uri)
    expect(result).toEqual({ duration: 120 })
  })

  it('should return duration as 0 when getAudioDuration resolves with null', async () => {
    ;(getAudioDuration as jest.Mock).mockResolvedValue(null)

    const result = await getAudioMetaData(uri)

    expect(getAudioDuration).toHaveBeenCalledWith(uri)
    expect(result).toEqual({ duration: 0 })
  })

  it('should return duration as 0 when getAudioDuration rejects', async () => {
    ;(getAudioDuration as jest.Mock).mockRejectedValue(new Error('Error'))

    const result = await getAudioMetaData(uri)

    expect(getAudioDuration).toHaveBeenCalledWith(uri)
    expect(result).toEqual({ duration: 0 })
  })
})
