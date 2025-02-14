import { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import { FlashList } from '@shopify/flash-list'

import { DMItem, getDmRequests } from '@holepunchto/keet-store/store/room'

import { NavBar } from 'component/NavBar'
import s from 'lib/commonStyles'
import { SAFE_EDGES } from 'lib/constants'
import { back } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

import { DMRequestHeader } from './DMRequests.Header'
import { DMRequestItem } from './DMRequests.Item'

const DMRequestsScreen = () => {
  const strings = useStrings()

  const keyExtractor = useCallback((item: DMItem) => item.invitation, [])
  const renderItem = useCallback(({ item }: { item: DMItem }) => {
    return <DMRequestItem item={item} />
  }, [])
  const requests = useSelector(getDmRequests)
  useEffect(() => {
    // if user accepts all invitations, go back to prev screen
    if (requests.length === 0) {
      back()
    }
  }, [requests.length])
  return (
    <SafeAreaView style={s.container} edges={SAFE_EDGES}>
      <NavBar title={strings.chat.dm.dmRequests} />
      <FlashList
        ListHeaderComponent={
          <DMRequestHeader numOfRequests={requests.length} />
        }
        data={requests}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        estimatedItemSize={83}
      />
    </SafeAreaView>
  )
}

export default DMRequestsScreen
