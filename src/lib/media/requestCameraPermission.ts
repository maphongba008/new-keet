import { Camera } from 'expo-camera'

import { consoleError } from 'lib/errors'

export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const permission = await Camera.requestCameraPermissionsAsync()

    return permission.granted
  } catch (error) {
    consoleError('Failed to request Camera permission', error)
  }

  return false
}
