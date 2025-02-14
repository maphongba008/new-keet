import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { useFocusEffect } from '@react-navigation/native'

import { getIsAppBackgrounded } from 'reducers/application'

export const useMinuteUpdate = () => {
  const [update, setUpdate] = useState(0)
  const intervalRef = useRef<any>(null)
  const isAppBackgrounded = useSelector(getIsAppBackgrounded)

  const triggerUpdate = useCallback(() => setUpdate((u: number) => ++u), [])

  const startTimer = useCallback(() => {
    if (intervalRef.current) return
    triggerUpdate()
    intervalRef.current = setInterval(triggerUpdate, 60000)
  }, [triggerUpdate])

  const stopTimer = useCallback(() => {
    if (intervalRef.current === null) return
    clearInterval(intervalRef.current)
    intervalRef.current = null
  }, [])

  useEffect(() => {
    if (isAppBackgrounded) {
      stopTimer()
      return
    }
    startTimer()
  }, [isAppBackgrounded, startTimer, stopTimer])

  useFocusEffect(
    useCallback(() => {
      startTimer()
      return () => stopTimer()
    }, [startTimer, stopTimer]),
  )

  return update
}
