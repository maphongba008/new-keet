import { useEffect, useState } from 'react'
import { DeviceType } from 'expo-device'
import * as ExpoDevice from 'expo-device'
import * as ScreenOrientation from 'expo-screen-orientation'

let deviceType: DeviceType

const isPhone = async () => {
  if (!deviceType) {
    deviceType = await ExpoDevice.getDeviceTypeAsync()
  }
  return deviceType === DeviceType.PHONE
}

export const useScreenOrientationLock = () => {
  useEffect(() => {
    lockScreenPortraitUpAsync()
  }, [])
}

export const useEnableLandscape = () => {
  useEffect(() => {
    ScreenOrientation.unlockAsync()
    return () => {
      lockScreenPortraitUpAsync()
    }
  }, [])
}

export const lockScreenPortraitUpAsync = async () => {
  const phone = await isPhone()
  if (phone) {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)
  }
}

export const unlockScreenAsync = () => {
  ScreenOrientation.unlockAsync()
}

export const useScreenOrientation = () => {
  const [orientation, setOrientation] = useState(
    ScreenOrientation.Orientation.PORTRAIT_UP,
  )

  useEffect(() => {
    const subscription = ScreenOrientation.addOrientationChangeListener((e) => {
      setOrientation(e.orientationInfo.orientation)
    })

    return () => {
      ScreenOrientation.removeOrientationChangeListener(subscription)
    }
  }, [])

  return {
    orientation,
    isPortraitUpOrientation:
      orientation === ScreenOrientation.Orientation.PORTRAIT_UP,
    isLandscapeOrientation:
      orientation === ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
      orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT,
  }
}
