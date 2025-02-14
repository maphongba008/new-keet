import { useCallback, useEffect } from 'react'
import { BackHandler } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'

export function useBackHandler(handler: () => boolean) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      handler,
    )
    return () => backHandler.remove()
  }, [handler])
}

export function useFocusedBackHandler(handler: () => boolean) {
  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        handler,
      )
      return () => backHandler.remove()
    }, [handler]),
  )
}
