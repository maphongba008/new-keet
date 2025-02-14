import * as DocumentPicker from 'expo-document-picker'

import { OnSendFiles, processAndSendAssets } from './processAndSendAssets'
import { consoleError } from '../errors'
import { showErrorNotifier } from '../hud'
import { setPendingUploadsAmount } from '../uploads'

export const pickAndSendDocument = (opts: {
  roomId: string
  onSendFiles: OnSendFiles
}) => {
  DocumentPicker.getDocumentAsync({
    multiple: true,
  })
    .then(async (result) => {
      if (result.canceled || !result.assets) {
        return
      }

      await processAndSendAssets(
        opts.roomId,
        result.assets,
        opts?.onSendFiles,
        true,
      )
    })
    .catch((err) => {
      setPendingUploadsAmount(0)
      showErrorNotifier(err.message)
      consoleError(err)
    })
}
