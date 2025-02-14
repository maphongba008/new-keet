import { useDispatch } from 'react-redux'
import { AppStackParams } from 'src/navigation/types'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import { closeAppModal } from 'reducers/application'

import { popToPage, SCREEN_MODAL } from 'lib/navigation'

export const useAppNavigation = <T extends keyof AppStackParams>() => {
  return useNavigation<NativeStackNavigationProp<AppStackParams, T>>()
}

export const useAppRoute = <T extends keyof AppStackParams>() => {
  return useRoute<RouteProp<AppStackParams, T>>()
}

export const useExitOnboardingIDSetup = () => {
  const dispatch = useDispatch()

  return () => {
    popToPage(SCREEN_MODAL)

    // to close the ID Setup modal
    dispatch(closeAppModal())
  }
}
