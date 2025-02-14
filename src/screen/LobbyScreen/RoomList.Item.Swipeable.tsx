import { memo, useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import isEqual from 'react-fast-compare'
import _compact from 'lodash/compact'

import { getPreferencesRoomNotifications } from '@holepunchto/keet-store/store/preferences'
import { leaveRoomAsk } from '@holepunchto/keet-store/store/room'

import { toggleRoomPushNotificationAction } from 'sagas/pushNotificationsSaga'

import SvgIcon from 'component/SvgIcon'
import { SwipeableView } from 'component/SwipeableView'
import { colors } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import { UI_SIZE_20 } from 'lib/commonStyles'
import { getRoomTypeFlags, useConfig } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

export const SwipeableRoomListItem = memo(
  ({ children, roomId }: { children: any; roomId: string }) => {
    const isNotificationsOn: boolean = useSelector((state) =>
      getPreferencesRoomNotifications(state, roomId),
    )
    const dispatch = useDispatch()
    const strings = useStrings()

    const { roomType } = useConfig(roomId)
    const { isDm } = getRoomTypeFlags(roomType)

    const toggleNotification = useCallback(() => {
      if (!roomId) {
        return
      }
      dispatch(toggleRoomPushNotificationAction(roomId))
    }, [dispatch, roomId])

    const onPressLeave = useCallback(() => {
      dispatch(leaveRoomAsk(roomId))
    }, [dispatch, roomId])

    const buttons = useMemo(
      () =>
        _compact([
          {
            icon: (
              <SvgIcon
                color={colors.white_snow}
                name={isNotificationsOn ? 'bellSlash' : 'bell'}
                width={UI_SIZE_20}
                height={UI_SIZE_20}
              />
            ),
            text: isNotificationsOn
              ? strings.common.mute
              : strings.common.unmute,
            backgroundColor: colors.keet_purple_1,
            onPress: toggleNotification,
            testID: APPIUM_IDs.lobby_swipable_btn_mute,
          },
          !isDm && {
            icon: (
              <SvgIcon
                color={colors.white_snow}
                name="trash"
                width={UI_SIZE_20}
                height={UI_SIZE_20}
              />
            ),
            text: strings.common.leave,
            backgroundColor: colors.red_400,
            onPress: onPressLeave,
            testID: APPIUM_IDs.lobby_swipable_btn_leave,
          },
        ]),
      [
        isDm,
        isNotificationsOn,
        onPressLeave,
        strings.common.leave,
        strings.common.mute,
        strings.common.unmute,
        toggleNotification,
      ],
    )

    return <SwipeableView buttons={buttons}>{children}</SwipeableView>
  },
  isEqual,
)
