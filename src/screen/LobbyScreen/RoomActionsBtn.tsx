import React, { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import LinearGradient from 'react-native-linear-gradient'

import {
  closeWalkthroughTooltip,
  getWalkthroughStep,
  getWalkthroughTooltip,
} from 'reducers/application'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { ButtonBase } from 'component/Button'
import MaskGradient from 'component/MaskGradient'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, gradient, useTheme } from 'component/theme'
import { Tooltip } from 'component/Tooltip'
import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import s, { UI_SIZE_16, UI_SIZE_18, UI_SIZE_40 } from 'lib/commonStyles'
import { setStorageWalkthroughTooltipShownDone } from 'lib/localStorage'

import { useStrings } from 'i18n/strings'

export default memo(() => {
  const strings = useStrings()
  const styles = getStyles()
  const theme = useTheme()
  const dispatch = useDispatch()
  const shouldShowTooltip = useSelector(getWalkthroughTooltip)
  const currentStep = useSelector(getWalkthroughStep)

  const onButtonBasePress = useCallback(() => {
    showBottomSheet({
      bottomSheetType: BottomSheetEnum.RoomActionSheet,
    })
  }, [])

  const onTooltipClose = useCallback(async () => {
    // Update local storage to mark the tooltip as shown
    setStorageWalkthroughTooltipShownDone()
    dispatch(closeWalkthroughTooltip())
  }, [dispatch])

  const ref = React.createRef<any>()
  return (
    <Tooltip
      componentRef={ref}
      step={2}
      content={
        <LinearGradient
          style={styles.buttonGradient}
          {...gradient.keet_gradient_brightBlue20}
        >
          <MaskGradient
            linearGradientProps={gradient.keet_gradient_brightBlue}
            MaskElement={
              <SvgIcon
                name="plus"
                width={UI_SIZE_18}
                height={UI_SIZE_18}
                color={theme.color.accent}
              />
            }
          />
        </LinearGradient>
      }
      placement="top"
      description={strings.room.walkthroughTooltip.createOrJoin}
      title={strings.room.walkthroughTooltip.getStarted}
      toShow={shouldShowTooltip && currentStep === 2}
      onClose={onTooltipClose}
      onPressNext={onTooltipClose}
      totalSteps={2}
      testProps={appiumTestProps(APPIUM_IDs.tooltip_btn_join_room)}
    >
      <View ref={ref}>
        <ButtonBase
          testID={APPIUM_IDs.lobby_btn_add_room}
          hint={strings.lobby.roomActions.createRoomBtn}
          onPress={onButtonBasePress}
        >
          <LinearGradient
            style={styles.buttonGradient}
            {...gradient.keet_gradient_brightBlue20}
          >
            <MaskGradient
              linearGradientProps={gradient.keet_gradient_brightBlue}
              MaskElement={
                <SvgIcon
                  name="plus"
                  width={UI_SIZE_18}
                  height={UI_SIZE_18}
                  color={theme.color.accent}
                />
              }
            />
          </LinearGradient>
        </ButtonBase>
      </View>
    </Tooltip>
  )
}, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    buttonGradient: {
      ...s.centeredLayout,
      borderRadius: theme.border.radiusNormal,
      height: UI_SIZE_40,
      width: UI_SIZE_40,
    },
    tooltipContainer: {
      backgroundColor: theme.color.bg,
      borderRadius: theme.border.radiusNormal,
      padding: UI_SIZE_16,
    },
  })
  return styles
})
