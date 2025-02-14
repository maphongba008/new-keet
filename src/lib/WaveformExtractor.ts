import { requireNativeModule } from 'expo-modules-core'

import { consoleError } from 'lib/errors'

import {
  MOBILE_AUDIO_MAX_BYTE_TO_GET_WAVEFORM,
  MOBILE_AUDIO_MAX_DURATION_TO_GET_WAVEFORM,
} from './constants'
import { UploadFile } from './uploads'

const WaveformModule = requireNativeModule('KeetWaveformModule')
// This function will extract audio waveform
// Returns promise and will be timed out after 60 sec if not able to extract for large audio files
export const extractWaveformData = async (
  uri: string,
  { duration, byteLength }: { duration?: number; byteLength?: number },
) => {
  try {
    if (byteLength && byteLength > MOBILE_AUDIO_MAX_BYTE_TO_GET_WAVEFORM)
      return null
    if (duration && duration > MOBILE_AUDIO_MAX_DURATION_TO_GET_WAVEFORM)
      return null
    if (!byteLength && !duration) return null

    const waveformDataResult = await WaveformModule.extractWaveform(uri)
    return waveformDataResult || []
  } catch (err) {
    consoleError('Error extracting audio waveform data', err)
    return null
  }
}

export const extractWaveformDataFromFile = async (file?: UploadFile) => {
  try {
    const { byteLength, duration, path } = file || {}

    if (byteLength && byteLength > MOBILE_AUDIO_MAX_BYTE_TO_GET_WAVEFORM)
      return null
    if (duration && duration > MOBILE_AUDIO_MAX_DURATION_TO_GET_WAVEFORM)
      return null
    if (!byteLength && !duration) return null

    const waveformDataResult = await WaveformModule.extractWaveform(path)
    return waveformDataResult || []
  } catch (err) {
    consoleError('Error extracting audio waveform data from file', err)
    return null
  }
}
