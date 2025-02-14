import { getAudioDuration } from 'lib/fileManager'
import { UploadFile } from 'lib/uploads'

type AudioMetaData = Pick<UploadFile, 'duration'>

export const getAudioMetaData = async (uri: string): Promise<AudioMetaData> => {
  let duration
  try {
    duration = await getAudioDuration(uri)
  } catch (error) {}

  return { duration: duration || 0 }
}
