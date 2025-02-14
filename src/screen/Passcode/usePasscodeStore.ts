import { create } from 'zustand'

export enum MessageType {
  Success = 'success',
  Error = 'error',
}

export enum AutoLockTime {
  OneMinute = '1',
  TwoMinutes = '2',
  FiveMinutes = '5',
  FifteenMinutes = '15',
  Never = 'Never',
}

type MessageTypeOrNull = MessageType | null

interface PasscodeState {
  message: string
  messageType: MessageTypeOrNull
  userHasPasscode: boolean
  autoLockTime: AutoLockTime

  setAutoLockTime: (time: AutoLockTime) => void
  setUserHasPasscode: (value: boolean) => void
  setMessage: (message: string) => void
  setMessageType: (messageType: MessageTypeOrNull) => void
  resetMessage: () => void
}

export const usePasscodeStore = create<PasscodeState>((set) => ({
  message: '',
  messageType: null,
  userHasPasscode: false,
  autoLockTime: AutoLockTime.Never,

  setAutoLockTime: (time: AutoLockTime) => {
    set((state) => {
      if (state.autoLockTime !== time) {
        return { autoLockTime: time }
      }
      return state
    })
  },
  setUserHasPasscode: (value: boolean) => {
    set((state) => {
      if (state.userHasPasscode !== value) {
        return { userHasPasscode: value }
      }
      return state
    })
  },
  setMessage: (message: string) => {
    set((state) => {
      if (state.message !== message) {
        return { message }
      }
      return state
    })
  },
  setMessageType: (messageType: MessageTypeOrNull) => {
    set((state) => {
      if (state.messageType !== messageType) {
        return { messageType }
      }
      return state
    })
  },
  resetMessage: () => set({ message: '', messageType: null }),
}))
