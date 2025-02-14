const getTwoDigitNumber = (n: number) => (n > 9 ? `${n}` : `0${n}`)
export const parseVideoDuration = (duration: number): string => {
  let durationLeftOver = duration
  const hours = Math.floor(duration / 3600)
  durationLeftOver -= hours * 3600
  const minutes = Math.floor(duration / 60)
  durationLeftOver -= minutes * 60

  // mm:ss
  const defaultTimer = `${getTwoDigitNumber(minutes)}:${getTwoDigitNumber(
    Math.floor(durationLeftOver),
  )}`
  if (hours > 0) {
    // hh:mm:ss
    return `${getTwoDigitNumber(hours)}:${defaultTimer}`
  }

  return defaultTimer
}
