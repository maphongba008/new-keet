import { Camera } from 'expo-camera'

import { consoleError } from 'lib/errors'

export const requestMicrophonePermission = async (): Promise<boolean> => {
  try {
    const permission = await Camera.requestMicrophonePermissionsAsync()

    return permission.granted
  } catch (error) {
    consoleError('Failed to request Microphone permission', error)
  }

  return false
}
