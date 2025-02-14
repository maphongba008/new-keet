import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Image } from 'expo-image'

import {
  getCurrentSoundUri,
  setShareContent,
  setSoundUri,
} from 'reducers/application'

const useRoomCleanup = () => {
  const dispatch = useDispatch()
  const currentSoundUri = useSelector(getCurrentSoundUri)

  useEffect(() => {
    return () => {
      Image.clearMemoryCache()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (currentSoundUri !== '') {
        dispatch(setSoundUri(''))
      }
    }
  }, [currentSoundUri, dispatch])

  useEffect(() => {
    return () => {
      dispatch(setShareContent(null))
    }
  }, [dispatch])
}

export default useRoomCleanup
