import { useCallback, useEffect } from 'react'
import { AppState, AppStateStatus } from 'react-native'

import {
  AutoLockTime,
  usePasscodeStore,
} from 'screen/Passcode/usePasscodeStore'
import { getAppAutoLockTime } from 'lib/localStorage'
import { navigationRef } from 'lib/navigation'

import { useAppStore } from './useAppState'

/**
 * Custom hook to automatically lock the app after a period of inactivity.
 * It sets up event listeners for user interactions and app state changes.
 */
export const useAutoLock = () => {
  const { autoLockTime, userHasPasscode, setAutoLockTime } = usePasscodeStore()

  const lockApp = useCallback(() => {
    useAppStore.setState({
      isAuthenticated: false,
    })
  }, [])

  useEffect(() => {
    const fetchedAutolockTime = getAppAutoLockTime()
    setAutoLockTime(fetchedAutolockTime)
  }, [setAutoLockTime])

  useEffect(() => {
    let timer: NodeJS.Timeout

    const resetTimer = () => {
      if (autoLockTime === AutoLockTime.Never || !userHasPasscode) {
        return
      }
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(lockApp, parseInt(autoLockTime, 10) * 60 * 1000)
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        resetTimer()
      } else {
        if (timer) {
          clearTimeout(timer)
        }
      }
    }

    const handleNavigationStateChange = () => {
      resetTimer()
    }

    // Set up event listeners
    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    const unsubscribeNavigation = navigationRef.addListener(
      'state',
      handleNavigationStateChange,
    )

    resetTimer()

    return () => {
      // Clean up event listeners
      appStateSubscription.remove()
      unsubscribeNavigation()
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [autoLockTime, userHasPasscode, lockApp])

  return null
}
