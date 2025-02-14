import * as Haptics from 'expo-haptics'

export const doVibrateSuccess = () => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
}
