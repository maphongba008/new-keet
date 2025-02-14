import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { create } from 'zustand'

import { usePasscodeStore } from 'screen/Passcode/usePasscodeStore'
import { SHOW_PASSCODE } from 'lib/build.constants'
import { getStoragePasscode } from 'lib/localStorage'

export interface AppStateProps {
  isAuthenticated: boolean
}

export const useAppStore = create<AppStateProps>(() => ({
  isAuthenticated: true,
}))

export const useAppState = () => {
  const { setUserHasPasscode } = usePasscodeStore()

  const [initialAppState, setInitialAppState] =
    useState<AppStateStatus>('active')
  const lastBackgroundTimeRef = useRef<number | null>(null)

  const fetchPasscode = useCallback(() => {
    const passcode = getStoragePasscode()
    const hasPasscode = passcode !== null && passcode !== undefined
    setUserHasPasscode(hasPasscode)

    useAppStore.setState({
      isAuthenticated: !hasPasscode,
    })
  }, [setUserHasPasscode])

  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      const currentTime = Date.now()

      if (initialAppState === 'active' && nextAppState === 'background') {
        // App is going to background or becoming inactive from active state
        lastBackgroundTimeRef.current = currentTime
      } else if (
        initialAppState === 'background' &&
        nextAppState === 'active'
      ) {
        // App is returning to active state from background
        // Check if the app was in the background for more than an hour
        if (
          lastBackgroundTimeRef.current &&
          currentTime - lastBackgroundTimeRef.current > 3600000
        ) {
          fetchPasscode()
        }
      }

      // Update the initialAppState to the latest state
      setInitialAppState(nextAppState)
    },
    [initialAppState, setInitialAppState, fetchPasscode],
  )

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    )

    return () => {
      subscription.remove()
    }
  }, [handleAppStateChange])

  useEffect(() => {
    // Fetch passcode initially when the component mounts
    fetchPasscode()
  }, [fetchPasscode])

  return null
}

export const isUserAuthenticated = () => {
  return !SHOW_PASSCODE || useAppStore.getState().isAuthenticated
}
