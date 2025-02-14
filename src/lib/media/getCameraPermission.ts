import { Camera } from 'expo-camera'

import {
  Permission,
  PERMISSIONS,
} from '@holepunchto/keet-store/store/media/media-constraints'

import { consoleError } from 'lib/errors'

export const getCameraPermission = async (): Promise<Permission> => {
  try {
    const permission = await Camera.getCameraPermissionsAsync()

    return permission.status as Permission
  } catch (error) {
    consoleError('Failed to get Camera permission', error)
  }

  return PERMISSIONS.UNKNOWN
}
