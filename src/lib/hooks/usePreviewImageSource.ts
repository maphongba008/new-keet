import { useMemo } from 'react'
import { ImageSource } from 'expo-image'

export const usePreviewImageSource = (
  previewUri?: string,
): string | ImageSource | null => {
  const imgPreviewSource = useMemo(() => {
    if (previewUri?.startsWith('data:image')) {
      return previewUri
    }
    if (previewUri) {
      return { uri: previewUri }
    }
    return null
  }, [previewUri])

  return imgPreviewSource
}
