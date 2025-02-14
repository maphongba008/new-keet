import React, { memo, ReactNode, useMemo } from 'react'
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native'
import { Image } from 'expo-image'

import { getFirstLetters } from '@holepunchto/keet-store/store/lib/string'

import { APPIUM_IDs, appiumTestProps } from 'lib/appium'
import { getScaledFontSize, randomColor } from 'lib/avatar'
import s, {
  ICON_SIZE_72,
  UI_SIZE_2,
  UI_SIZE_12,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { MemberType } from 'lib/types'

import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheet } from './theme'

// https://github.com/holepunchto/settings/blob/651dcd959994fc1f270f2da5ffbf37fb3fa0ba2e/settings.js#L150

export interface AvatarProps {
  base64?: string | null
  seed?: string
  small?: boolean
  style?: ViewProps['style']
  name?: string | null
  color?: string | null
}

export interface AvatarContainerProps {
  children?: ReactNode
  small?: boolean
  style?: ViewProps['style']
}

export const AvatarContainer: React.FC<AvatarContainerProps> = ({
  small,
  style,
  children,
}) => {
  const styles = getStyles()
  const containerStyle = useMemo(() => {
    if (small) {
      return [style, styles.smallContainer]
    }

    return [style]
  }, [small, style, styles.smallContainer])

  return <View style={containerStyle}>{children}</View>
}

export const Avatar: React.FC<AvatarProps> = memo(
  ({ base64: uri, seed, small, style, color, name }) => {
    const styles = getStyles()

    const avatarDisplayName = getFirstLetters(name ?? '').substring(0, 2)
    const avatarStyle = useMemo(() => {
      const avatarStyles: StyleProp<ViewStyle> = []

      if (!uri) {
        avatarStyles.push(s.centeredLayout, {
          backgroundColor: color || randomColor(seed),
        })
      }

      if (small) {
        avatarStyles.push(styles.smallImg, style)
      } else {
        avatarStyles.push(styles.bigImg, style)
      }

      return StyleSheet.flatten(avatarStyles)
    }, [color, seed, small, style, styles.bigImg, styles.smallImg, uri])

    const circleSize = small ? 16 : 40

    if (uri) {
      return (
        <Image
          style={avatarStyle as ImageStyle}
          source={{ uri }}
          contentFit="contain"
          recyclingKey={uri}
          cachePolicy="memory"
          {...appiumTestProps(APPIUM_IDs.avatar_image)}
        />
      )
    }

    if (avatarDisplayName) {
      return (
        <View style={avatarStyle} {...appiumTestProps(APPIUM_IDs.avatar_image)}>
          <Text
            style={[
              styles.avatarText,
              {
                fontSize: getScaledFontSize(avatarStyle),
              },
            ]}
          >
            {avatarDisplayName}
          </Text>
        </View>
      )
    }
    return (
      <View style={avatarStyle} {...appiumTestProps(APPIUM_IDs.avatar_image)}>
        <SvgIcon
          name="keetOutline"
          width={circleSize}
          height={circleSize}
          color={colors.white_snow}
        />
      </View>
    )
  },
)

type MemberAvatarProps = {
  member: Partial<MemberType>
} & AvatarProps

export const MemberAvatar = ({ member, ...props }: MemberAvatarProps) => {
  const base64 = useMemo(() => {
    return member?.blocked ? null : member?.avatarUrl
  }, [member])

  return (
    <Avatar
      name={member.displayName}
      small
      base64={base64}
      color={member?.color}
      seed={member?.swarmId}
      {...props}
    />
  )
}

export const AVATAR_SIZE = UI_SIZE_32 - UI_SIZE_2
export const AVATAR_SIZE_BIG = ICON_SIZE_72
export const LOBBY_AVATAR_SIZE = 55

interface AvatarStyleSizeParams {
  size: number
  borderWidth: number
  padding: number
}

const getStyles = createThemedStylesheet((theme) => {
  const smallPreset: AvatarStyleSizeParams = {
    size: AVATAR_SIZE,
    borderWidth: 1,
    padding: 1,
  }
  const bigPreset: AvatarStyleSizeParams = {
    size: AVATAR_SIZE_BIG,
    borderWidth: 2,
    padding: 1,
  }

  const getContainerStyle = ({
    size,
    borderWidth,
    padding,
  }: AvatarStyleSizeParams) => ({
    borderRadius: size / 2,
    borderWidth,
    padding,
    borderColor: theme.color.red_400,
    width: size,
    height: size,
  })

  const getImgStyle = (
    { size, borderWidth, padding }: AvatarStyleSizeParams,
    isHighlighted?: boolean,
  ) => {
    const sizeInset = isHighlighted ? size - 2 * (borderWidth + padding) : size

    return {
      width: sizeInset,
      height: sizeInset,
      borderRadius: sizeInset / 2,
    }
  }

  const styles = StyleSheet.create({
    avatarText: {
      ...theme.text.bodyBold,
      fontSize: UI_SIZE_12,
    },
    bigImg: getImgStyle(bigPreset),
    smallContainer: getContainerStyle(smallPreset),
    smallImg: getImgStyle(smallPreset),
  })
  return styles
})
