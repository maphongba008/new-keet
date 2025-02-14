export const wait = (ms: number) =>
  // eslint-disable-next-line clean-timer/assign-timer-id
  new Promise((resolve) => setTimeout(resolve, ms))
