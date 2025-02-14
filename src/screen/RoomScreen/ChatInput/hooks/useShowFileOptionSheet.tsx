import { useCallback } from 'react'

import { showOptionsSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import { OptionSheetOption } from 'component/AppBottomSheet/SheetComponents/components/OptionsButtonList'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { pickAndSendDocument, pickAndSendImageOrVideo } from 'lib/media'

import { useStrings } from 'i18n/strings'

export const useShowFileOptionSheet = (
  roomId: string,
  onSendFiles: (file: any) => void,
  onPickImagesFromGallery: () => Promise<void>,
) => {
  const strings = useStrings()

  return useCallback(() => {
    const options: OptionSheetOption[] = [
      {
        title: strings.chat.pickDoc,
        icon: 'copy',
        onPress: () => {
          pickAndSendDocument({ roomId, onSendFiles })
        },
        ...appiumTestProps(APPIUM_IDs.room_attach_doc),
      },
      {
        title: strings.chat.recordVideo,
        icon: 'video',
        onPress: () => {
          pickAndSendImageOrVideo({
            roomId,
            fromCamera: true,
            video: true,
            onSendFiles,
          })
        },
        ...appiumTestProps(APPIUM_IDs.room_capture_video),
      },
      {
        title: strings.chat.takePhoto,
        icon: 'camera',
        onPress: () => {
          pickAndSendImageOrVideo({
            roomId,
            fromCamera: true,
            video: false,
            onSendFiles,
          })
        },
        ...appiumTestProps(APPIUM_IDs.room_capture_img),
      },
      {
        title: strings.chat.pickImageLibrary,
        icon: 'image',
        onPress: onPickImagesFromGallery,
        ...appiumTestProps(APPIUM_IDs.room_attach_media),
      },
    ]
    showOptionsSheet({ options })
  }, [
    roomId,
    onPickImagesFromGallery,
    strings.chat.pickDoc,
    strings.chat.pickImageLibrary,
    strings.chat.recordVideo,
    strings.chat.takePhoto,
    onSendFiles,
  ])
}
