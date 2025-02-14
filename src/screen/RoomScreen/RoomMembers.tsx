import React, { useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'
import _debounce from 'lodash/debounce'
import _get from 'lodash/get'

import { searchMembers } from '@holepunchto/keet-store/store/member-list'

import GestureContainer from 'component/GestureContainer'
import { NavBar } from 'component/NavBar'
import { RoomParticipants } from 'component/RoomParticipants'
import { SearchBar } from 'component/SearchBar'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_8 } from 'lib/commonStyles'
import { INPUT_DEBOUNCE_WAIT_TIME } from 'lib/constants'
import WithRoomIdRendered from 'lib/hoc/withRoomIdRendered'

import { useStrings } from 'i18n/strings'

export const RoomMembers = WithRoomIdRendered(({ roomId, route }: any) => {
  const strings = useStrings()
  const styles = getStyles()
  const dispatch = useDispatch()
  const { memberId, isFromModView } = _get(route, 'params', {})

  const [searchValue, setSearchValue] = useState<string>('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    _debounce((searchStr: string) => {
      dispatch(searchMembers(searchStr))
    }, INPUT_DEBOUNCE_WAIT_TIME),
    [],
  )

  const handleSearch = useCallback(
    (text: string) => {
      setSearchValue(text)
      debouncedSearch(text)
    },
    [debouncedSearch],
  )

  useEffect(() => {
    return () => {
      dispatch(searchMembers(''))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <GestureContainer>
      <NavBar title={strings.room.members} middle={null} />
      <View style={[s.row, styles.searchBar]}>
        <SearchBar
          searchStr={searchValue}
          setSearchStr={handleSearch}
          isRoomMemberPlaceholder
          testProps={appiumTestProps(APPIUM_IDs.members_search)}
        />
      </View>
      <RoomParticipants
        isFromModView={isFromModView}
        roomId={roomId}
        memberId={memberId}
      />
    </GestureContainer>
  )
})

export default RoomMembers

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    searchBar: { marginBottom: UI_SIZE_8 },
  })
  return styles
})
