import { Platform } from 'react-native'

export const isAndroid = Platform.OS === 'android'
export const isIOS = Platform.OS === 'ios'
export const platformVersion: number | null = (() => {
  if (Platform.OS === 'android') {
    return Platform.constants.Version
  } else if (Platform.OS === 'ios') {
    return parseInt(Platform.Version, 10)
  }
  return null
})()

export const interactiveKeyboardDismissMode =
  Platform.OS === 'ios' ? 'interactive' : 'on-drag'
