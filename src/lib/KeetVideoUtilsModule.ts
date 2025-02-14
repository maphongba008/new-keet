import { Image, NativeModules } from 'react-native'
import { ImageSize } from 'expo-camera'
import { requireNativeModule } from 'expo-modules-core'

const { HolepunchBindings } = NativeModules

export const getMimeType: (
  url: string,
  callback: (mime?: string) => void,
) => void = HolepunchBindings.getMimeType

export const getMimeTypeAsync = (url: string): Promise<string | undefined> =>
  new Promise<string | undefined>((resolve) => {
    const imageUrl = url.split('\\?')[0].split(/\?.*|:[a-z]+$/g)[0]
    getMimeType(imageUrl, resolve)
  })

type MediaSizeGetter = (uri: string) => Promise<ImageSize | null>
interface KeetVideoUtilsModuleType {
  getSize: MediaSizeGetter
}

export const getVideoSizeAsync: MediaSizeGetter = async (uri) =>
  (await requireNativeModule<KeetVideoUtilsModuleType>(
    'KeetVideoUtilsModule',
  ).getSize(uri)) || null

export const getImageSizeAsync: MediaSizeGetter = (uri) =>
  new Promise((resolve) => {
    Image.getSize(
      uri,
      (width, height) => {
        resolve({ height, width })
      },
      () => {
        resolve(null)
      },
    )
  })

export const getMediaSizeAsync = async (url: string, mimeType?: string) => {
  let dimensions: ImageSize | null = null
  try {
    if (!mimeType) {
      mimeType = await getMimeTypeAsync(url)
    }
    if (mimeType?.startsWith('image')) {
      dimensions = await getImageSizeAsync(url)
    } else if (mimeType?.startsWith('video')) {
      dimensions = await getVideoSizeAsync(url)
    }
  } catch (error) {
    console.log('getMediaSizeAsync', error)
  }
  return dimensions
}
