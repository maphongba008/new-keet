import React, { useCallback } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'

import { getErrors } from '@holepunchto/keet-store/store/error'

import { NavBar } from 'component/NavBar'
import { useTheme } from 'component/theme'
import s, { UI_SIZE_12 } from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'

import { useStrings } from 'i18n/strings'

import ErrorLogItem from './ErrorLogItem'

export type ErrorType = {
  grouped: number
  timestamp: number
  type: string
  message: string
  stack: string
  roomId: string
  roomTitle: string
}

const ErrorLog = () => {
  const strings = useStrings()
  const theme = useTheme()
  const errorLogs: Array<ErrorType> = useSelector(getErrors)

  const renderErrorLog = useCallback(({ item }: { item: ErrorType }) => {
    return <ErrorLogItem error={item} />
  }, [])

  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title={strings.account.errorLog} />
      {errorLogs.length === 0 ? (
        <View style={[s.container, s.centeredLayout]}>
          <Text style={theme.text.body}>{strings.errorLog.noErrorLogs}</Text>
        </View>
      ) : (
        <FlashList
          data={errorLogs}
          contentContainerStyle={styles.container}
          renderItem={renderErrorLog}
          estimatedItemSize={50}
        />
      )}
    </SafeAreaView>
  )
}

export default ErrorLog

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: UI_SIZE_12,
  },
})
