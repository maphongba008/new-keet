import { useEffect, useState } from 'react'
import { Keyboard, Platform } from 'react-native'

export const useKeyboardHeight = () => {
  const [keyBoardHeight, setKeyBoardHeight] = useState(0)

  useEffect(() => {
    const keyBoardDidShow = (frames: any) => {
      setKeyBoardHeight(frames.endCoordinates.height)
    }

    const keyBoardDidHide = () => {
      setKeyBoardHeight(0)
    }
    const s1 = Keyboard.addListener(
      Platform.select({
        ios: 'keyboardWillShow',
        android: 'keyboardDidShow',
        default: 'keyboardWillShow',
      }),
      keyBoardDidShow,
    )
    const s2 = Keyboard.addListener(
      Platform.select({
        ios: 'keyboardWillHide',
        android: 'keyboardDidHide',
        default: 'keyboardWillHide',
      }),
      keyBoardDidHide,
    )
    return () => {
      s1?.remove()
      s2?.remove()
    }
  }, [])

  return keyBoardHeight
}

export const waitOnKeyboardDidDismiss = () =>
  new Promise<Boolean>((resolve) => {
    if (Keyboard.isVisible()) {
      const listener = Keyboard.addListener('keyboardDidHide', () => {
        listener.remove()
        resolve(true)
      })

      Keyboard.dismiss()
    } else {
      resolve(false)
    }
  })

type KeyboardBehavior = 'padding' | 'height'

export const keyboardBehavior: KeyboardBehavior = Platform.select({
  ios: 'padding',
  android: 'height',
  default: 'padding',
})
