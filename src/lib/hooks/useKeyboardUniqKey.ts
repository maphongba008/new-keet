import { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'
import { useIsFocused } from '@react-navigation/native'

export const useKeyboardUniqKey = () => {
  const [key, setKey] = useState(Math.random())
  const isFocused = useIsFocused()

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (!isFocused) {
          setKey(Math.random()) // Update key only if the screen is not focused
        }
      },
    )

    return () => keyboardDidHideListener.remove()
  }, [isFocused])

  return key
}
