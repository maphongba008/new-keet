import React, { memo, useMemo } from 'react'
import { StyleSheet, Text, TextStyle, View } from 'react-native'
import isEqual from 'react-fast-compare'

import MemberTag from 'component/MemberTag'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_4,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_16,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { getRoomTypeFlags, useRoom } from 'lib/hooks/useRoom'

import { useStrings } from 'i18n/strings'

import { CallMemberNameProps } from './type'

export const CallMemberName = memo(
  ({
    unknownMember,
    member,
    isSelf,
    showMyName,
    centerAlign,
    textStyle,
    style,
    small,
    viewWidth,
    isMemberTagList,
    roomId,
  }: CallMemberNameProps) => {
    const strings = useStrings()
    const styles = getStyles()

    const { isDm } = getRoomTypeFlags(useRoom(roomId)?.roomType)

    const name = member?.displayName
    const themeStyles: TextStyle | undefined = member?.theme
    const showTag = (!centerAlign || !small) && !isDm

    const nameText = useMemo(() => {
      if (isSelf && !showMyName) return strings.chat.you

      if (unknownMember || !name) return strings.call.connecting

      return name
    }, [
      isSelf,
      showMyName,
      strings.chat.you,
      strings.call.connecting,
      unknownMember,
      name,
    ])

    const viewMaxWidth = useMemo(() => {
      if (!viewWidth) return undefined

      return viewWidth - UI_SIZE_32 // minus the estimated horizontal padding
    }, [viewWidth])

    return (
      <View style={[styles.nameContainer, { maxWidth: viewMaxWidth }, style]}>
        <Text style={[styles.name, textStyle, themeStyles]} numberOfLines={1}>
          {nameText}
        </Text>
        {showTag && (
          <View style={s.centerAlignedRow}>
            <MemberTag
              member={member}
              isList={isMemberTagList}
              containerStyleProps={
                isSelf && showMyName ? styles.myTagContainer : undefined
              }
            />
          </View>
        )}
      </View>
    )
  },
  isEqual,
)

export const CallMemberNameWithIcon = memo(
  ({
    unknownMember,
    isMuted,
    member,
    isSelf,
    leftAlign,
    centerAlign,
    small,
    viewWidth,
    roomId,
  }: CallMemberNameProps) => {
    const styles = getStyles()

    const viewMaxWidth = useMemo(() => {
      if (!viewWidth) return undefined

      return viewWidth - UI_SIZE_32 // minus the estimated horizontal padding
    }, [viewWidth])

    return (
      <View
        style={[
          styles.container,
          leftAlign && styles.leftContainer,
          centerAlign && styles.centerContainer,
          { maxWidth: viewMaxWidth },
        ]}
      >
        {!isMuted && (
          <SvgIcon
            color={colors.blue_400}
            name="waveformLines"
            width={UI_SIZE_12}
            height={UI_SIZE_12}
          />
        )}
        <CallMemberName
          member={member}
          isSelf={isSelf}
          unknownMember={unknownMember}
          centerAlign={centerAlign}
          style={styles.nameWithIconContainer}
          textStyle={styles.nameWithIcon}
          small={small}
          roomId={roomId}
        />
      </View>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    centerContainer: {
      left: undefined,
      right: undefined,
    },
    container: {
      alignItems: 'center',
      backgroundColor: theme.color.grey_500,
      borderRadius: UI_SIZE_16,
      bottom: UI_SIZE_8,
      flexDirection: 'row',
      paddingHorizontal: UI_SIZE_8,
      paddingVertical: UI_SIZE_4,
      position: 'absolute',
      right: UI_SIZE_16,
    },
    leftContainer: {
      left: UI_SIZE_16,
      right: undefined,
    },
    myTagContainer: {
      marginRight: UI_SIZE_6,
    },
    name: {
      ...theme.text.body,
      flexShrink: 1,
      fontSize: 12,
      marginHorizontal: UI_SIZE_4,
    },
    nameContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      flexShrink: 1,
      marginTop: UI_SIZE_12,
    },
    nameWithIcon: {
      ...theme.text.btmTab,
      marginLeft: UI_SIZE_4,
    },
    nameWithIconContainer: {
      marginTop: 0,
    },
  })
  return styles
})
