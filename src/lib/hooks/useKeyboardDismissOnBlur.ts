import { useEffect } from 'react'
import { Keyboard } from 'react-native'
import { useNavigation } from '@react-navigation/native'

const useKeyboardDismissOnBlur = () => {
  const navigation = useNavigation()

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => Keyboard.dismiss())

    return unsubscribe
  }, [navigation])
}

export default useKeyboardDismissOnBlur
