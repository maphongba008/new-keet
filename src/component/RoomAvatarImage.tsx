import React, { memo, ReactNode, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { Image, ImageProps } from 'expo-image'
import isEqual from 'react-fast-compare'

import SvgIcon, { SvgIconType } from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { UI_SIZE_8, UI_SIZE_20 } from 'lib/commonStyles'
import { getRoomTypeFlags, useRoom, useRoomAvatar } from 'lib/hooks/useRoom'

import { AVATAR_SIZE } from './Avatar'

interface RoomAvatarImageProps
  extends Omit<ImageProps, 'source' | 'cachePolicy' | 'placeholder'> {
  roomId: string
  size?: number
  isChannel?: boolean
  placeholder?: ReactNode
}

export const RoomAvatarImage = memo(
  ({
    roomId,
    size = AVATAR_SIZE,
    placeholder,
    style,
    ...imgProps
  }: RoomAvatarImageProps) => {
    const { isChannel, isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)
    const styles = getStyles()
    const avatar = useRoomAvatar(roomId)
    const defaultRoomAvatar = useMemo((): SvgIconType => {
      if (isChannel) {
        return 'broadcast'
      }
      if (isDm) {
        return 'keetOutline'
      }
      return 'usersGroup'
    }, [isChannel, isDm])
    const avatarBackground = useMemo(() => {
      if (isChannel) {
        return colors.indigo_700
      }
      if (isDm) {
        return colors.fuschia_900
      }
      return colors.blue_600
    }, [isChannel, isDm])
    const avatarStyles = useMemo(
      () => [
        styles.avatar,
        { backgroundColor: avatarBackground },
        {
          width: size,
          height: size,
          borderRadius: isChannel ? UI_SIZE_8 : size / 2,
        },
        style,
      ],
      [styles.avatar, avatarBackground, size, isChannel, style],
    )

    if (!avatar && placeholder) {
      return placeholder
    }
    if (!avatar && !placeholder) {
      return (
        <View style={avatarStyles as any}>
          <SvgIcon
            name={defaultRoomAvatar}
            color={colors.white_snow}
            width={UI_SIZE_20}
            height={UI_SIZE_20}
          />
        </View>
      )
    }

    return (
      <Image
        source={avatar}
        cachePolicy="memory-disk"
        style={avatarStyles}
        {...imgProps}
      />
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    avatar: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_500,
      borderColor: theme.color.grey_500,
      borderRadius: UI_SIZE_8,
      borderWidth: 1,
      height: AVATAR_SIZE,
      justifyContent: 'center',
      width: AVATAR_SIZE,
    },
  })
  return styles
})
