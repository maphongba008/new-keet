import React, { useCallback } from 'react'
import { Keyboard, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'

import { IconButton } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { ICON_SIZE_20 } from 'lib/commonStyles'
import { navigate, SCREEN_ROOM_INVITE } from 'lib/navigation'

import { useStrings } from 'i18n/strings'

export const RoomInvitation = () => {
  const styles = getStyles()
  const strings = useStrings()
  const roomId = useSelector(getAppCurrentRoomId)
  const share = useCallback(() => {
    Keyboard.dismiss()
    if (roomId) {
      navigate(SCREEN_ROOM_INVITE, { roomId })
    }
  }, [roomId])

  return (
    <IconButton
      style={styles.icon}
      hint={strings.common.share}
      onPress={share}
      {...appiumTestProps(APPIUM_IDs.room_btn_invite)}
    >
      <SvgIcon
        name="userPlus"
        width={ICON_SIZE_20}
        height={ICON_SIZE_20}
        color={colors.white_snow}
      />
    </IconButton>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    icon: {
      ...s.centeredLayout,
      height: theme.bars.navigationBarHeight,
      width: theme.bars.navigationBarHeight,
    },
  })
  return styles
})
