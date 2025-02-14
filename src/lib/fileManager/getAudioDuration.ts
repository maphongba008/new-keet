import { Audio } from 'expo-av'

export const getAudioDuration = async (uri: string): Promise<number | null> => {
  try {
    const player = new Audio.Sound()
    const metadata = await player.loadAsync({ uri })
    const durationMillis = metadata.isLoaded && metadata.durationMillis

    if (metadata.isLoaded) await player.unloadAsync()
    if (durationMillis) return durationMillis
  } catch (error) {}

  return null
}
