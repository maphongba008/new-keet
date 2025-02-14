import { Alert } from 'react-native'

import { callLeave } from '@holepunchto/keet-store/store/call'

import type { Strings } from 'i18n/strings'

import { doVibrateSuccess } from './haptics'
import { getDispatch } from './store'

type showCallOnGoingAlertProps = {
  onPressLeave: Function
  onPressStay?: Function
  alertDesc?: string
  strings: Strings
}

export const showCallOnGoingAlert = ({
  onPressLeave,
  onPressStay,
  alertDesc,
  strings,
}: showCallOnGoingAlertProps) => {
  Alert.alert(
    strings.call.alertTitle,
    alertDesc || strings.call.alertDesc,
    [
      {
        text: strings.call.stayInCall,
        onPress: () => {
          onPressStay?.()
        },
        style: 'cancel',
      },
      {
        text: strings.call.leaveCall,
        onPress: () => {
          onPressLeave?.()
        },
        style: 'destructive',
      },
    ],
    { cancelable: true },
  )
}

export const dismissCall = () => {
  try {
    const dispatch = getDispatch()
    dispatch(callLeave())
    doVibrateSuccess()
  } catch (err) {
    console.log('Error in dismissCall', err)
  }
}
