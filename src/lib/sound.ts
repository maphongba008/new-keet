import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Audio,
  AVPlaybackSource,
  InterruptionModeAndroid,
  InterruptionModeIOS,
} from 'expo-av'
import { create } from 'zustand'
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware'

import {
  getAppCurrentCallRoomId,
  isOngoingCallByRoomId,
} from '@holepunchto/keet-store/store/app'

import { getCurrentSoundUri, getIsOnSilentMode } from 'reducers/application'

import { useTimeout } from './hooks'
import { Keys, localStorage } from './localStorage'

// Zustand storage
interface SoundStoreState {
  isInAppNotificationSoundEnabled: boolean
  setInAppNotificationSound: (bool: boolean) => void
}
export const useSoundStore = create<SoundStoreState>()(
  persist(
    (set) => ({
      isInAppNotificationSoundEnabled: true,
      setInAppNotificationSound: (bool: boolean) =>
        set({ isInAppNotificationSoundEnabled: bool }),
    }),
    {
      name: Keys.IN_APP_NOTIFICATION_SOUND,
      storage: createJSONStorage(() => localStorage as StateStorage),
    },
  ),
)

// Sound
export const SOUND_RECEIVE_NEW_MSG = require('resources/receive.mp3')
export const SOUND_SEND_MSG = require('resources/send.mp3')

export const usePlaySound = () => {
  const [sound, setSound] = useState<Audio.Sound>()
  const isInAppNotificationSoundEnabled = useSoundStore(
    (state) => state.isInAppNotificationSoundEnabled,
  )
  const isMuted = useSelector(getIsOnSilentMode)
  const callRoomId = useSelector(getAppCurrentCallRoomId)
  const isCallOnGoing = useSelector((state) =>
    isOngoingCallByRoomId(state, callRoomId),
  )
  const currentSoundUri = useSelector(getCurrentSoundUri)

  const soundUnloadWithDelay = useTimeout<Audio.Sound>(async (_sound) => {
    await _sound?.unloadAsync()
  }, 500)

  const playSound = useCallback(
    async (assetPath: AVPlaybackSource) => {
      if (
        !isInAppNotificationSoundEnabled ||
        isCallOnGoing ||
        currentSoundUri ||
        isMuted
      )
        return
      await Audio.setAudioModeAsync({
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
      })
      const { sound: _sound } = await Audio.Sound.createAsync(assetPath)
      setSound(_sound)
      await _sound.playAsync()
      // Unload the audio from memory as soon as finish playing the sound
      // This also allows other apps to continue play audio in full sound without ducking after play the message sound
      soundUnloadWithDelay(_sound)
    },
    [
      currentSoundUri,
      isCallOnGoing,
      isInAppNotificationSoundEnabled,
      isMuted,
      soundUnloadWithDelay,
    ],
  )

  useEffect((): any => {
    return async () => {
      return sound ? await sound?.unloadAsync() : undefined
    }
  }, [sound])
  return playSound
}
