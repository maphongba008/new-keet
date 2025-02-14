import { waitFor } from '@testing-library/react-native'
import { Camera } from 'expo-camera'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'
import * as EXImageManipulator from 'expo-image-manipulator'
import * as EXImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { showErrorNotifier, showInfoNotifier } from 'lib/hud'
import { getMediaSizeAsync, getMimeTypeAsync } from 'lib/KeetVideoUtilsModule'
import {
  ensureExpoCameraPermissions,
  pickAndSendDocument,
  pickAndSendImageOrVideo,
  pickAndSetAvatar,
  pickBarcodeImage,
} from 'lib/media'

import { getStrings } from 'i18n/strings'

jest.mock('component/AppBottomSheet/AppBottomSheet.Store', () => ({
  closeBottomSheet: jest.fn(),
  showBottomSheet: jest.fn(),
}))

jest.mock('expo-file-system', () => ({
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  moveAsync: jest.fn(),
  copyAsync: jest.fn(),
}))

jest.mock('lib/hud', () => ({
  showErrorNotifier: jest.fn(),
  showInfoNotifier: jest.fn(),
}))

jest.mock('lib/KeetVideoUtilsModule', () => jest.fn())
jest.mock('lib/uploads', () => ({
  ...jest.requireActual('lib/uploads'),
  getUploadsDir: () => 'mocked-dir/uploads/',
}))

jest.mock('expo-camera', () => ({
  Camera: {
    scanFromURLAsync: jest.fn(),
    getCameraPermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
  },
}))

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}))

jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(),
}))

jest.mock('expo-image-picker', () => {
  return {
    ...jest.requireActual('expo-image-picker'),
    launchCameraAsync: jest.fn(),
    launchImageLibraryAsync: jest.fn(),
  }
})

jest.mock('expo-image-manipulator', () => {
  return {
    ...jest.requireActual('expo-image-manipulator'),
    manipulateAsync: jest.fn(),
    ImageManipulator: {
      manipulate: jest.fn(),
    },
  }
})

jest.mock('../KeetVideoUtilsModule', () => ({
  getMimeTypeAsync: jest.fn(),
  getMediaSizeAsync: jest.fn(),
}))

const strings = getStrings()

describe('media.ts', () => {
  afterEach(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })

  describe('ensureExpoCameraPermissions', () => {
    ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    })
    ;(Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue({
      granted: false,
    })
    it('should call showBottomSheet with permission required when there is no permission', async () => {
      await ensureExpoCameraPermissions({ isOverrideDefaultPermission: false })

      expect(showBottomSheet).toHaveBeenCalledWith({
        bottomSheetType: BottomSheetEnum.PermissionRequired,
        title: strings.common.cameraPermissionRequired,
        close: expect.anything(),
      })
    })

    it('should throw an error when permissions are not granted and isOverrideDefaultPermission is true', async () => {
      await expect(
        ensureExpoCameraPermissions({
          isOverrideDefaultPermission: true,
        }),
      ).rejects.toThrow()
    })

    it('should not call showBottomSheet when user already have camera permission', async () => {
      ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })

      await ensureExpoCameraPermissions({ isOverrideDefaultPermission: false })

      expect(showBottomSheet).not.toHaveBeenCalled()
    })
  })

  describe('pickBarcodeImage', () => {
    it('should return did cancel true when user has permission and picture is not chosen', async () => {
      ;(MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      })

      const response = await pickBarcodeImage()

      expect(response).toEqual({
        didCancel: true,
      })
    })

    it('should return qrcode data properly when barcode is selected', async () => {
      ;(MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'mocked-asset-uri',
          },
        ],
      })
      ;(Camera.scanFromURLAsync as jest.Mock).mockResolvedValue([
        {
          data: 'mocked-bar-code',
        },
      ])

      const response = await pickBarcodeImage()

      expect(response).toEqual({
        didCancel: false,
        qrCode: 'mocked-bar-code',
      })
    })

    it('should throw an error if qrcode is not found', async () => {
      ;(Camera.scanFromURLAsync as jest.Mock).mockResolvedValue([])
      ;(MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: 'mocked-asset-uri',
          },
        ],
      })
      ;(Camera.scanFromURLAsync as jest.Mock).mockResolvedValue([])

      await expect(pickBarcodeImage()).rejects.toThrow()
    })
  })

  describe('pickAndSendImageOrVideo', () => {
    const mockMediaLibraryPermissions = () => {
      ;(MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
    }

    const mockCameraPermissions = () => {
      ;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
    }

    const mockMimeType = () => {
      ;(getMimeTypeAsync as jest.Mock).mockResolvedValue('pdf')
    }

    const mockFileSystemInfo = () => {
      ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      })
    }

    it('should call onSendFiles only to successfully parsed assets that are not from camera', async () => {
      mockMediaLibraryPermissions()
      mockMimeType()
      mockFileSystemInfo()
      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            fileName: 'mocked-file-name',
            uri: 'mocked-asset-uri',
            fileSize: 100,
            type: 'pdf',
            width: 100,
            height: 100,
          },
          {},
        ],
      })

      const mockedOnSendFiles = jest.fn()
      await pickAndSendImageOrVideo({
        roomId: 'mocked-room-id',
        onSendFiles: mockedOnSendFiles,
      })

      await waitFor(() => {
        expect(mockedOnSendFiles).toHaveBeenCalledTimes(1)
      })
    })

    it('should call onSendFiles only to successfully parsed assets that are from camera', async () => {
      mockMimeType()
      mockFileSystemInfo()
      mockCameraPermissions()
      ;(EXImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: [
          {
            fileName: 'mocked-file-name',
            uri: 'mocked-asset-uri',
            fileSize: 100,
            type: 'pdf',
            width: 100,
            height: 100,
          },
          {},
        ],
      })

      const mockedOnSendFiles = jest.fn()
      await pickAndSendImageOrVideo({
        roomId: 'mockedRoomId',
        fromCamera: true,
        onSendFiles: mockedOnSendFiles,
      })

      await waitFor(() => {
        expect(mockedOnSendFiles).toHaveBeenCalledTimes(1)
      })
    })

    it('should throw an error when more than 10 files are selected', async () => {
      mockMediaLibraryPermissions()
      mockMimeType()
      mockFileSystemInfo()

      const mockSetPendingUploadsAmount = jest
        .spyOn(require('../uploads'), 'setPendingUploadsAmount')
        .mockImplementation(jest.fn())

      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        canceled: false,
        assets: Array.from({ length: 11 }, (_, i) => ({
          fileName: `file${i + 1}`,
          uri: `file-uri-${i + 1}`,
          fileSize: 100,
          type: 'pdf',
          width: 100,
          height: 100,
        })),
      })

      const mockedOnSendFiles = jest.fn()
      await pickAndSendImageOrVideo({
        roomId: 'mocked-room-id',
        onSendFiles: mockedOnSendFiles,
      })

      expect(showInfoNotifier).toHaveBeenCalledWith(
        strings.chat.fileLimitAmountReached,
      )
      expect(mockSetPendingUploadsAmount).toHaveBeenCalled()

      mockSetPendingUploadsAmount.mockRestore()
    })

    it.each([{ assets: [] }, { assets: null }])(
      'should not call onSendFiles when no asset is chosen',
      async ({ assets }) => {
        mockMimeType()
        mockFileSystemInfo()
        mockCameraPermissions()
        ;(EXImagePicker.launchCameraAsync as jest.Mock).mockResolvedValue({
          assets,
        })

        const mockedOnSendFiles = jest.fn()
        await pickAndSendImageOrVideo({
          roomId: 'mockedRoomId',
          fromCamera: true,
          onSendFiles: mockedOnSendFiles,
        })

        await waitFor(() => {
          expect(mockedOnSendFiles).toHaveBeenCalledTimes(0)
        })
      },
    )
  })

  describe('pickAndSendDocument', () => {
    it('should call onSendFiles only to successfully parsed assets', async () => {
      ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        assets: [
          {
            name: 'mocked-file',
            size: 20,
            mimeType: 'pdf',
            uri: 'mocked-uri/',
          },
          {},
        ],
      })
      ;(getMediaSizeAsync as jest.Mock).mockResolvedValue({
        height: 100,
        width: 100,
      })
      ;(getMimeTypeAsync as jest.Mock).mockResolvedValue('pdf')
      ;(FileSystem.getInfoAsync as jest.Mock).mockResolvedValue({
        exists: true,
      })

      const mockedOnSendFiles = jest.fn()
      pickAndSendDocument({
        roomId: 'mocked-room-id',
        onSendFiles: mockedOnSendFiles,
      })

      await waitFor(() => {
        expect(mockedOnSendFiles).toHaveBeenCalledTimes(1)
      })
    })

    it('should call showErrorNotifier when something goes wrong', async () => {
      const unexpectedError = new Error('unexpected')
      ;(DocumentPicker.getDocumentAsync as jest.Mock).mockRejectedValue(
        unexpectedError,
      )

      const mockSetPendingUploadsAmount = jest
        .spyOn(require('../uploads'), 'setPendingUploadsAmount')
        .mockImplementation(jest.fn())

      pickAndSendDocument({
        roomId: 'mocked-room-id',
        onSendFiles: jest.fn(),
      })

      await waitFor(() => {
        expect(showErrorNotifier).toHaveBeenCalledWith(unexpectedError.message)
      })

      expect(mockSetPendingUploadsAmount).toHaveBeenCalled()

      mockSetPendingUploadsAmount.mockRestore()
    })

    it('should do nothing when no document is chosen', () => {
      ;(DocumentPicker.getDocumentAsync as jest.Mock).mockResolvedValue({
        canceled: true,
      })

      const mockedOnSend = jest.fn()
      pickAndSendDocument({
        roomId: 'mocked-room-id',
        onSendFiles: mockedOnSend,
      })

      expect(mockedOnSend).toHaveBeenCalledTimes(0)
    })
  })

  describe('pickAndSetAvatar', () => {
    it('should call updateAvatar when selected image is ok', async () => {
      ;(MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
      const expectedData = 'mocked-data'
      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue({
        assets: [
          {
            base64: expectedData,
            width: 112,
            height: 112,
            fileSize: 112,
            uri: 'mocked-path',
          },
        ],
      })
      ;(
        EXImageManipulator.ImageManipulator.manipulate as jest.Mock
      ).mockReturnValue({
        resize: jest.fn(),
        renderAsync: jest.fn().mockResolvedValue({
          saveAsync: jest.fn().mockResolvedValue({
            base64: 'mocked-data',
            width: 112,
            height: 112,
            uri: 'mocked-path',
          }),
        }),
      })

      const expectedResponse = {
        width: 112,
        height: 112,
        size: 112,
        path: 'mocked-path',
      }
      const updateAvatarFn = jest.fn()

      await pickAndSetAvatar({ fromCamera: false }, updateAvatarFn)

      await waitFor(() => {
        expect(updateAvatarFn).toHaveBeenCalledWith(
          expectedData,
          expectedResponse,
        )
      })
    })

    it('should call showErrorNotifier when image selection is canceled', async () => {
      ;(MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
      const canceledError = new Error('canceled image selection')
      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockRejectedValue(
        canceledError,
      )

      const updateAvatarFn = jest.fn()
      await pickAndSetAvatar({ fromCamera: false }, updateAvatarFn)

      expect(showErrorNotifier).toHaveBeenCalledWith(canceledError.message)
    })

    it('should do nothing when no asset is chosen', async () => {
      ;(MediaLibrary.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        granted: true,
      })
      ;(EXImagePicker.launchImageLibraryAsync as jest.Mock).mockResolvedValue(
        null,
      )

      const updateAvatarFn = jest.fn()

      await pickAndSetAvatar({ fromCamera: false }, updateAvatarFn)

      expect(updateAvatarFn).not.toHaveBeenCalled()
    })
  })
})
