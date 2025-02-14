import { create } from 'zustand'

interface StorageState {
  isConsentNeeded: boolean | null
  isOnboarding: boolean | null
}

const useStore = create<StorageState>(() => ({
  isConsentNeeded: null,
  isOnboarding: null,
}))

const isConsentNeeded$ = (state: StorageState) =>
  state.isConsentNeeded && !state.isOnboarding
const isOnboarding$ = (state: StorageState) => state.isOnboarding

export const useIsConsentNeeded = () => useStore(isConsentNeeded$)
export const setIsConsentNeeded = (isConsentNeeded: boolean) =>
  useStore.setState({ isConsentNeeded })
export const useIsOnboarding = () => useStore(isOnboarding$)
export const setIsOnboarding = (isOnboarding: boolean) =>
  useStore.setState({ isOnboarding })
