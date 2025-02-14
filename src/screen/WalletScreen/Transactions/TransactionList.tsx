import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { FlashList } from '@shopify/flash-list'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { timeToLastMessage } from 'lib/date'
import { getPaymentBackend } from 'lib/wallet'

const data = getPaymentBackend().getTransactionData()

const Transaction = ({ item }: any) => {
  const styles = getStyles()
  return (
    <View style={styles.wrapper}>
      <SvgIcon
        name="circleUser"
        width={UI_SIZE_32}
        height={UI_SIZE_32}
        color={colors.white_snow}
      />
      <View style={styles.userDetails}>
        <Text numberOfLines={1} ellipsizeMode="middle" style={styles.user}>
          {item?.from || `To ${item?.to}`}
        </Text>
        {!!item?.desc && <Text style={styles.userMeta}>{item.desc}</Text>}
        <Text style={styles.userMeta}>
          {timeToLastMessage(item.timestamp)} ago
        </Text>
      </View>
      <View style={styles.amountDetails}>
        <Text style={styles.amountBtc}>
          <Text
            style={
              item.amountBtc > 0
                ? styles.amountBtcPositive
                : styles.amountBtcNegative
            }
          >
            {item.amountBtc > 0 ? '+' : '-'} {Math.abs(item.amountBtc)}
          </Text>{' '}
          BTC
        </Text>
        <Text style={styles.amountUsd}>
          {item.amountUsd > 0 ? '+' : '-'} ${Math.abs(item.amountUsd)}
        </Text>
      </View>
    </View>
  )
}

const TransactionList = () => {
  const styles = getStyles()
  const renderItem = useCallback(({ item }: any) => {
    return <Transaction item={item} />
  }, [])

  const keyExtractor = useCallback((item: any) => item.id, [])

  return (
    <FlashList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={renderItem}
      estimatedItemSize={86}
      contentContainerStyle={styles.container}
    />
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    amountBtc: {
      ...theme.text.bodySemiBold,
      fontSize: 15,
    },
    amountBtcNegative: {
      color: theme.color.red_400,
    },
    amountBtcPositive: {
      color: theme.color.green_300,
    },
    amountDetails: {
      ...s.container,
      ...s.alignItemsEnd,
    },
    amountUsd: {
      ...theme.text.body,
      color: theme.color.grey_200,
      fontSize: 13,
    },
    container: {
      paddingTop: UI_SIZE_24,
    },
    user: {
      ...theme.text.bodySemiBold,
      fontSize: 14,
    },
    userDetails: {
      ...s.container,
      marginLeft: UI_SIZE_8,
    },
    userMeta: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: 12,
    },
    wrapper: {
      ...s.centerAlignedRow,
      backgroundColor: theme.color.grey_800,
      borderRadius: UI_SIZE_16,
      marginBottom: UI_SIZE_8,
      padding: UI_SIZE_16,
    },
  })
  return styles
})

export default memo(TransactionList)
