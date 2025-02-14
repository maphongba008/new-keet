import * as FileSystem from 'expo-file-system'

export const getUploadsDir = () => `${FileSystem.cacheDirectory!}uploads/`
