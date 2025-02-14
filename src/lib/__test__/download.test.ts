import { waitFor } from '@testing-library/react-native'
import * as FileSystem from 'expo-file-system'

import {
  deleteAttachmentsFromCache,
  deleteCacheFile,
  downloadAttachment,
} from 'lib/download'
import { consoleError } from 'lib/errors'

jest.mock('expo-clipboard', () => jest.fn())
jest.mock('expo-media-library', () => jest.fn())
jest.mock('react-native-share', () => jest.fn())
jest.mock('lib/errors', () => ({
  consoleError: jest.fn(),
}))

jest.mock('expo-file-system', () => ({
  deleteAsync: jest.fn(),
  getInfoAsync: jest.fn().mockReturnValue({ exists: true }),
  createDownloadResumable: jest.fn(),
}))

const mockedAttachment = {
  uri: '/mocked-uri',
  type: 'pdf',
}

const onProgress = jest.fn()

describe('downloads.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe('deleteAttachmentsFromCache', () => {
    it('should delete each attached file from cache', async () => {
      const mockedAttachments = [
        {
          id: '1',
          path: '/mocked-1',
          type: 'jpg',
          byteLength: 10,
          isUploading: false,
          isDownloading: false,
        },
        {
          id: '2',
          path: '/mocked-2',
          type: 'png',
          byteLength: 12,
          isUploading: false,
          isDownloading: false,
        },
      ]
      deleteAttachmentsFromCache(mockedAttachments)

      expect(FileSystem.getInfoAsync).toHaveBeenCalledTimes(
        mockedAttachments.length,
      )
      await waitFor(
        () => {
          expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(
            mockedAttachments.length,
          )
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
          expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
            `file://${mockedAttachments[0].path}`,
            { idempotent: true },
          )
          // eslint-disable-next-line testing-library/no-wait-for-multiple-assertions
          expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
            `file://${mockedAttachments[1].path}`,
            { idempotent: true },
          )
        },
        { timeout: 500 },
      )
    })

    it('should call consoleError when deleteAttachmentsFromCache fails', async () => {
      const unexpectedError = new Error('unexpected error')

      ;(FileSystem.getInfoAsync as jest.Mock).mockReturnValue({
        exists: true,
      })
      ;(FileSystem.deleteAsync as unknown as jest.Mock).mockRejectedValue(
        unexpectedError,
      )

      const mockedAttachments = [
        {
          id: '1',
          path: '/mocked-1',
          type: 'jpg',
          byteLength: 10,
          isUploading: false,
          isDownloading: false,
        },
      ]

      deleteAttachmentsFromCache(mockedAttachments)

      expect(FileSystem.getInfoAsync).toHaveBeenCalledTimes(
        mockedAttachments.length,
      )
      await waitFor(() => {
        expect(FileSystem.deleteAsync).toHaveBeenCalledTimes(
          mockedAttachments.length,
        )
      })
      await expect(FileSystem.deleteAsync).rejects.toThrow()
      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(unexpectedError)
      })
    })
  })

  describe('deleteCacheFile', () => {
    it('should delete file from cache', async () => {
      const mockedPath = 'mocked-file-path'

      ;(FileSystem.getInfoAsync as jest.Mock).mockReturnValue({ exists: true })

      await deleteCacheFile(mockedPath)

      expect(FileSystem.getInfoAsync).toHaveBeenCalled()

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(
        `file://${mockedPath}`,
        {
          idempotent: true,
        },
      )
    })

    it('should call consoleError when deleteCacheFile fails', async () => {
      const mockedError = new Error('error while deleting file')

      ;(FileSystem.getInfoAsync as jest.Mock).mockReturnValue({ exists: true })
      ;(FileSystem.deleteAsync as unknown as jest.Mock).mockRejectedValue(
        mockedError,
      )
      const mockedPath = 'mocked-file-path'

      await deleteCacheFile(mockedPath)
      await waitFor(() => {
        expect(FileSystem.getInfoAsync).toHaveBeenCalledTimes(1)
      })

      await expect(FileSystem.deleteAsync).rejects.toThrow()
      expect(consoleError).toHaveBeenCalledWith(mockedError)
    })
  })

  describe('downloadAttachment', () => {
    it('should download attachment properly using fetch', async () => {
      const mockedDownloadAsync = jest.fn().mockResolvedValue({
        uri: 'mocked-uri',
      })

      ;(
        FileSystem.createDownloadResumable as unknown as jest.Mock
      ).mockReturnValue({
        downloadAsync: mockedDownloadAsync,
      })

      const { fetch, cancel } = downloadAttachment(mockedAttachment, onProgress)

      expect(FileSystem.createDownloadResumable).toHaveBeenCalled()

      expect(fetch).toBeDefined()
      expect(cancel).toBeDefined()

      const uri = await fetch()

      expect(uri).toBe('mocked-uri')
    })

    it('should cancel download properly using cancel', async () => {
      const mockedCancel = jest.fn()

      ;(
        FileSystem.createDownloadResumable as unknown as jest.Mock
      ).mockReturnValue({
        cancelAsync: mockedCancel,
      })

      const { fetch, cancel } = downloadAttachment(mockedAttachment, onProgress)

      expect(FileSystem.createDownloadResumable).toHaveBeenCalled()

      expect(fetch).toBeDefined()
      expect(cancel).toBeDefined()

      await cancel()

      expect(mockedCancel).toHaveBeenCalled()
    })

    it('should log error when cancel fails', async () => {
      const cancelError = new Error('cancel error')
      const mockedCancelAsync = jest.fn().mockRejectedValue(cancelError)

      ;(
        FileSystem.createDownloadResumable as unknown as jest.Mock
      ).mockReturnValue({
        downloadAsync: jest.fn(),
        cancelAsync: mockedCancelAsync,
      })

      const { cancel } = downloadAttachment(mockedAttachment, onProgress)

      expect(FileSystem.createDownloadResumable).toHaveBeenCalled()

      await cancel()

      expect(consoleError).toHaveBeenCalledWith(cancelError)
    })

    it('should log error when fetch fails', async () => {
      const downloadError = new Error('download error')
      const mockedDownloadAsync = jest.fn().mockRejectedValue(downloadError)

      ;(
        FileSystem.createDownloadResumable as unknown as jest.Mock
      ).mockReturnValue({
        downloadAsync: mockedDownloadAsync,
      })

      const { fetch } = downloadAttachment(mockedAttachment, onProgress)

      expect(FileSystem.createDownloadResumable).toHaveBeenCalled()

      const uri = await fetch()

      expect(uri).toBeUndefined()
      expect(consoleError).toHaveBeenCalledWith(downloadError)
    })
  })
})
