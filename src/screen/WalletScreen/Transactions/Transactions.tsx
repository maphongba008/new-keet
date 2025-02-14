import React, { memo, useState } from 'react'
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'

import { createThemedStylesheet } from 'component/theme'
import TransactionList from 'screen/WalletScreen/Transactions/TransactionList'
import s, { TRANSPARENT, UI_SIZE_8 } from 'lib/commonStyles'

const renderScene = SceneMap({
  completed: TransactionList,
  pending: TransactionList,
})

interface renderLabelI {
  route: {
    title: string
  }
  focused: boolean
}
const renderLabel = ({ route, focused }: renderLabelI) => {
  const styles = getStyles()
  return (
    <Text style={[styles.tabLabel, !focused && styles.tabLabelDisabled]}>
      {route.title}
    </Text>
  )
}

const renderTabBar = (props: any) => {
  const styles = getStyles()

  return (
    <TabBar
      {...props}
      indicatorStyle={styles.tabIndicator}
      style={styles.tabStyle}
      renderLabel={renderLabel}
    />
  )
}

const Transactions = () => {
  const layout = useWindowDimensions()
  const styles = getStyles()

  const [index, setIndex] = useState(0)
  const [routes] = useState([
    { key: 'completed', title: 'Completed' },
    { key: 'pending', title: 'Pending' },
  ])

  return (
    <View style={s.container}>
      <Text style={styles.title}>Transactions</Text>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
      />
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    tabIndicator: {
      backgroundColor: theme.color.blue_400,
    },
    tabLabel: {
      ...theme.text.body,
      fontSize: 15,
      margin: UI_SIZE_8,
    },
    tabLabelDisabled: {
      color: theme.color.grey_300,
    },
    tabStyle: {
      backgroundColor: TRANSPARENT,
    },
    title: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_200,
      fontSize: 12,
    },
  })
  return styles
})

export default memo(Transactions)
