import React, { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'
import { ChatEventType, ReactionsType } from 'lib/types'

import AddReaction from './AddReaction'
import SingleReaction from './SingleReaction'
import { useToggleReaction } from '../../ChatEvents/hooks/useReactions'

interface ReactionsBarProp {
  reactions: ReactionsType
  messageId: ChatEventType['id']
  onLongPress: ({ isSkipToEmojiSheet }: { isSkipToEmojiSheet: boolean }) => void
  isMineEvent?: boolean
  canAdd?: boolean
}
const ReactionsBar = memo(
  ({
    reactions,
    messageId,
    onLongPress,
    isMineEvent,
    canAdd = true,
  }: ReactionsBarProp) => {
    const styles = getStyles()

    const onLongPressEmoji = useCallback(
      (e: string) => {
        showBottomSheet({
          bottomSheetType: BottomSheetEnum.EmojiSourceSheet,
          reactions,
          selectedReaction: e,
        })
      },
      [reactions],
    )

    const noop = useCallback(() => {}, [])

    const onToggleReaction = useToggleReaction(messageId)

    return (
      <>
        {!!reactions?.reactions?.length && (
          <View style={styles.reactions}>
            {reactions.reactions.map((obj) => {
              return (
                <SingleReaction
                  key={obj.text}
                  text={obj.text}
                  count={obj.count}
                  isMine={reactions.mine.includes(obj.text)}
                  onPress={canAdd ? onToggleReaction : noop}
                  onLongPressEmoji={onLongPressEmoji}
                  isMineEvent={isMineEvent}
                />
              )
            })}
            {canAdd && reactions.reactions?.length > 0 && (
              <AddReaction onPress={onLongPress} isMineEvent={isMineEvent} />
            )}
          </View>
        )}
      </>
    )
  },
  isEqual,
)

export default ReactionsBar

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    reactions: {
      ...s.row,
      flexDirection: 'row',
      flexShrink: 1,
      flexWrap: 'wrap',
      gap: 4,
    },
  })
  return styles
})
