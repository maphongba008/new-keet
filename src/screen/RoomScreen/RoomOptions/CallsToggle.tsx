import React, { memo, useCallback } from 'react'
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native'
import _debounce from 'lodash/debounce'

// @ts-ignore
import roomsApi from '@holepunchto/keet-store/api/rooms'

import { ButtonBase } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { ICON_SIZE_16, NETWORK_WARNING, UI_SIZE_4 } from 'lib/commonStyles'
import { BACK_DEBOUNCE_OPTIONS, INPUT_DEBOUNCE_WAIT_TIME } from 'lib/constants'
import { useConfig } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

const { useUpdateConfigMutation } = roomsApi

const BlockedIcon = () => (
  <SvgIcon
    name="phoneSlash"
    width={ICON_SIZE_16}
    height={ICON_SIZE_16}
    color={colors.white_snow}
  />
)
const SubscribedIcon = () => (
  <SvgIcon
    name="phoneFilled"
    width={ICON_SIZE_16}
    height={ICON_SIZE_16}
    color={NETWORK_WARNING}
  />
)

const CallsToggle: React.FC<{
  roomId: string
  style?: StyleProp<ViewStyle>
}> = ({ roomId, style }) => {
  const styles = getStyles()
  const strings = useStrings()

  const [updateConfig] = useUpdateConfigMutation()
  const { canCall } = useConfig(roomId)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const toggleCallConfig = useCallback(
    _debounce(
      () => {
        updateConfig({
          roomId,
          key: 'canCall',
          value: String(!canCall),
        })
      },
      INPUT_DEBOUNCE_WAIT_TIME,
      BACK_DEBOUNCE_OPTIONS,
    ),
    [canCall, roomId, updateConfig],
  )

  return (
    <ButtonBase
      hint="toggle-call"
      onPress={toggleCallConfig}
      style={style}
      {...appiumTestProps(APPIUM_IDs.options_btn_toggle_call)}
    >
      {canCall ? <SubscribedIcon /> : <BlockedIcon />}
      <Text style={styles.actionText}>
        {canCall ? strings.room.callEnabled : strings.room.callDisabled}
      </Text>
    </ButtonBase>
  )
}

export default memo(CallsToggle)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    actionText: {
      ...theme.text.bodySemiBold,
      fontSize: 14,
      marginTop: UI_SIZE_4,
      paddingHorizontal: UI_SIZE_4,
      textAlign: 'center',
    },
  })
  return styles
})
