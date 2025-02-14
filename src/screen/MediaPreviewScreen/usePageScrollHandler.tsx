import { useEvent, useHandler } from 'react-native-reanimated'

interface OnPageScrollEvent {
  offset: number
  position: number
}

interface OnPageSelectedEvent {
  position: number
}

type Handlers = {
  onPageScroll(event: OnPageScrollEvent, context: Record<string, unknown>): void
  onPageSelected(
    event: OnPageSelectedEvent,
    context: Record<string, unknown>,
  ): void
}

export const usePageScrollHandler = (
  handlers: Handlers,
  dependencies?: unknown[],
) => {
  const { context, doDependenciesDiffer } = useHandler(handlers, dependencies)
  const subscribeForEvents = ['onPageScroll', 'onPageSelected']

  return useEvent(
    (event) => {
      'worklet'
      const { onPageScroll, onPageSelected } = handlers
      if (
        onPageScroll &&
        event.eventName.endsWith('onPageScroll') &&
        'position' in event &&
        'offset' in event
      ) {
        onPageScroll(event as OnPageScrollEvent, context)
      } else if (
        onPageSelected &&
        event.eventName.endsWith('onPageSelected') &&
        'position' in event
      ) {
        onPageSelected(event as OnPageSelectedEvent, context)
      }
    },
    subscribeForEvents,
    doDependenciesDiffer,
  )
}
