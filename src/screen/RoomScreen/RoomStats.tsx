import React, { useCallback, useMemo } from 'react'
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSelector } from 'react-redux'

import {
  getChatLastSeenMessageSeq,
  getChatMessageCount,
  getChatMessageInitialCache,
  getChatMessageSeqLoaded,
  getChatMessagesInView,
  getChatMessageUnreadCount,
} from '@holepunchto/keet-store/store/chat'

import { getIsHistoryMode } from 'reducers/application'

import { colors, createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'
import { getState } from 'lib/store'

const RoomStats = () => {
  const styles = getStyles()

  const seqLoaded = useSelector(getChatMessageSeqLoaded)
  const inView = useSelector(getChatMessagesInView)
  const count = useSelector(getChatMessageCount)
  const unreadCount = useSelector(getChatMessageUnreadCount)
  const lastSeenSeq = useSelector(getChatLastSeenMessageSeq)
  const isHistoryMode = useSelector(getIsHistoryMode)
  const initialCache = useSelector(getChatMessageInitialCache)

  const data = useMemo(
    () => [
      {
        title: 'SL.btm',
        desc: `${seqLoaded.bottom}`,
        isWarning:
          seqLoaded.bottom < inView.bottom || // When user click query latest msg
          (seqLoaded.bottom === inView.bottom && count - 1 > seqLoaded.bottom), // Should always query more data if there's any
      },
      {
        title: 'IV.top',
        desc: `${inView.top}`,
        isWarning: inView.top === 0 || inView.top === -1,
      },
      {
        title: 'IV.btm',
        desc: `${inView.bottom}`,
        isWarning: inView.bottom === 0 || inView.bottom === -1,
      },
      {
        title: 'count',
        desc: count,
      },
      { title: 'unread', desc: unreadCount },
      { title: 'lastSeen', desc: lastSeenSeq },
      { title: 'IHM', desc: isHistoryMode ? '1' : '0' },
      { title: 'IC', desc: +initialCache, isWarning: initialCache },
    ],
    [
      count,
      inView.top,
      inView.bottom,
      isHistoryMode,
      lastSeenSeq,
      seqLoaded.bottom,
      unreadCount,
      initialCache,
    ],
  )

  const onPress = useCallback(() => {
    const url = `https://jsoneditoronline.org/#left=json.${encodeURIComponent(
      JSON.stringify(getState().chat.message),
    )}`
    Linking.openURL(url)
  }, [])

  return (
    <View style={s.row}>
      <ScrollView
        style={styles.scrollView}
        showsHorizontalScrollIndicator={false}
        horizontal={true}
      >
        {data.map(({ title, desc, isWarning }) => {
          return (
            <Pressable
              onLongPress={onPress}
              key={title}
              style={[
                styles.itemView,
                isWarning && { backgroundColor: colors.red_400 },
              ]}
            >
              <Text style={styles.title}>{`${title}`}</Text>
              <Text style={styles.desc}>{`${desc}`}</Text>
            </Pressable>
          )
        })}
      </ScrollView>
    </View>
  )
}

export default RoomStats

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    desc: {
      color: colors.white_snow,
      fontSize: 10,
    },
    itemView: {
      alignItems: 'flex-start',
      marginLeft: 4,
      paddingBottom: 3,
    },
    scrollView: { backgroundColor: theme.background.bg_1 },
    title: {
      ...theme.text.bodyBold,
      color: colors.white_snow,
      fontSize: 11,
    },
  })

  return styles
})
