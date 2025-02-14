import React, { useCallback, useState } from 'react'
import { StyleSheet } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import Animated, { FadeIn } from 'react-native-reanimated'

import {
  getSyncDeviceErrorMsg,
  setSyncDeviceErrorMsg,
} from '@holepunchto/keet-store/store/identity'
import {
  getRoomListSearchError,
  getRoomListSearchText,
  getRoomPairError,
  searchAllRooms,
  setRoomListSearchError,
  setRoomPairError,
} from '@holepunchto/keet-store/store/room'

import RoomPairingError from 'component/RoomPairingError'
import { SearchBar } from 'component/SearchBar'
import { createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_8, UI_SIZE_48 } from 'lib/commonStyles'
import { getErrorMessage } from 'lib/hooks/useErrorMessage'

export const RoomSearch = () => {
  const styles = getStyles()

  const dispatch = useDispatch()
  const roomSearchText = useSelector(getRoomListSearchText)
  const deviceSyncError = useSelector(getSyncDeviceErrorMsg)
  const pairError = useSelector(getRoomPairError)
  const searchError = useSelector(getRoomListSearchError)

  const [isFocused, setIsFocused] = useState(false)

  const errorMessage = getErrorMessage(
    deviceSyncError || pairError || searchError,
  )

  const hasErrorMessage = isFocused && !!errorMessage

  const unsetInputError = useCallback(() => {
    if (deviceSyncError) dispatch(setSyncDeviceErrorMsg(''))
    if (pairError) dispatch(setRoomPairError(''))
    if (searchError) dispatch(setRoomListSearchError(''))
  }, [deviceSyncError, dispatch, pairError, searchError])

  const onInputSearch = useCallback(
    (searchText: string) => {
      unsetInputError()
      dispatch(searchAllRooms(searchText))
    },
    [dispatch, unsetInputError],
  )

  const onInputFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const onInputBlur = useCallback(() => {
    unsetInputError()
    setIsFocused(false)
  }, [unsetInputError])

  return (
    <Animated.View style={s.container} entering={FadeIn}>
      <SearchBar
        searchStr={roomSearchText}
        setSearchStr={onInputSearch}
        containerStyle={{
          ...styles.searchContainerStyle,
          ...(hasErrorMessage && styles.inputError),
        }}
        onInputFocus={onInputFocus}
        onInputBlur={onInputBlur}
        testProps={appiumTestProps(APPIUM_IDs.lobby_input_search)}
        clearTestProps={appiumTestProps(APPIUM_IDs.lobby_btn_clear_search)}
      />
      {hasErrorMessage && (
        <RoomPairingError
          errorMessage={errorMessage}
          unsetInputError={unsetInputError}
          style={styles.errorNotice}
        />
      )}
    </Animated.View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    errorNotice: {
      marginRight: UI_SIZE_8,
      position: 'absolute',
      top: UI_SIZE_48,
    },
    inputError: {
      borderColor: theme.color.danger,
    },
    searchContainerStyle: {
      marginRight: UI_SIZE_8,
    },
  })
  return styles
})
