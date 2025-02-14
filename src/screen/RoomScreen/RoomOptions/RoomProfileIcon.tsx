import React, { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { ButtonBase } from 'component/Button'
import { RoomAvatarImage } from 'component/RoomAvatarImage'
import SvgIcon from 'component/SvgIcon'
import { createThemedStylesheet, getTheme } from 'component/theme'
import s, {
  ICON_SIZE_28,
  ICON_SIZE_90,
  UI_SIZE_2,
  UI_SIZE_8,
  UI_SIZE_16,
} from 'lib/commonStyles'
import { getRoomTypeFlags, useConfig, useMembership } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

const RoomProfileIcon: React.FC<{
  roomId: string
  large?: boolean
}> = ({ roomId, large = false }) => {
  const styles = getStyles()
  const theme = getTheme()
  const strings = useStrings()
  const { canModerate } = useMembership(roomId)
  const { roomType } = useConfig(roomId)
  const { isChannel, isDm } = getRoomTypeFlags(roomType)

  const onPress = useCallback(() => {
    if (canModerate) {
      showBottomSheet({
        bottomSheetType: BottomSheetEnum.RoomAvatarBottomSheet,
        roomId,
      })
    }
  }, [canModerate, roomId])
  const iconSize = large ? 32 : 10

  return (
    <ButtonBase
      hint={strings.menu.pickAvatar}
      onPress={onPress}
      disabled={isDm}
      disableFade={!canModerate}
    >
      <RoomAvatarImage
        roomId={roomId}
        style={[
          styles.roomProfileIcon,
          large && styles.largeIcon,
          isChannel && (large ? styles.channelLargeIcon : styles.channelIcon),
        ]}
        placeholder={
          <View
            style={[
              styles.roomProfileIcon,
              s.centeredLayout,
              large && styles.largeIcon,
              isChannel &&
                (large ? styles.channelLargeIcon : styles.channelIcon),
            ]}
          >
            <SvgIcon
              color={theme.color.grey_400}
              name="usersThree"
              width={iconSize}
              height={iconSize}
            />
          </View>
        }
      />
    </ButtonBase>
  )
}

export default memo(RoomProfileIcon)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    channelIcon: {
      borderRadius: UI_SIZE_8,
    },
    channelLargeIcon: {
      borderRadius: UI_SIZE_16,
    },
    largeIcon: {
      borderColor: theme.color.bg4,
      borderRadius: ICON_SIZE_90 / 2,
      borderWidth: UI_SIZE_2,
      height: ICON_SIZE_90,
      marginRight: 0,
      paddingTop: UI_SIZE_8,
      width: ICON_SIZE_90,
    },
    roomProfileIcon: {
      backgroundColor: theme.color.grey_600,
      borderRadius: ICON_SIZE_28 / 2,
      height: ICON_SIZE_28,
      marginRight: UI_SIZE_8,
      width: ICON_SIZE_28,
    },
  })
  return styles
})
