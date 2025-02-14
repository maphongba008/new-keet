import React, { memo, useMemo } from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'
import isEqual from 'react-fast-compare'
import _isEmpty from 'lodash/isEmpty'
import _map from 'lodash/map'

import { UI_SIZE_4, UI_SIZE_16, UI_SIZE_32 } from 'lib/commonStyles'
import { MemberType } from 'lib/types'

import { useStrings } from 'i18n/strings'

import { createThemedStylesheet, hexToRgbOpacity } from './theme'

interface MemberTagProps {
  member: Partial<MemberType>
  isList?: boolean
  containerStyleProps?: StyleProp<ViewStyle>
}

const MemberTag = memo(
  ({ member, isList = false, containerStyleProps }: MemberTagProps) => {
    const strings = useStrings()
    const styles = getStyles()

    const { isAdmin, isMod, isMe, blocked } = useMemo(
      () => ({
        isAdmin: member?.isAdmin,
        isMod: member?.canModerate,
        isMe: member?.isLocal,
        blocked: member?.blocked,
      }),
      [member?.blocked, member?.canModerate, member?.isAdmin, member?.isLocal],
    )

    const tagOptions = useMemo(() => {
      return [
        {
          label: strings.chat.you,
          value: isList ? isMe : false,
          getStyles: () => {
            const wrapperStyle = [styles.wrapperStyle, styles.meTag]
            const labelStyle = [styles.text, styles.adminText, styles.meLabel]
            return { wrapperStyle, labelStyle }
          },
        },
        {
          label: strings.room.inviteType.admin,
          value: isAdmin,
          getStyles: () => {
            const wrapperStyle = [styles.wrapperStyle, styles.adminTag]
            const labelStyle = [styles.text, styles.adminText, styles.tagLabel]
            return { wrapperStyle, labelStyle }
          },
        },
        {
          label: strings.room.modIndicator,
          value: !isAdmin ? isMod : false,
          getStyles: () => {
            const wrapperStyle = [styles.wrapperStyle, styles.modTag]
            const labelStyle = [styles.text, styles.modText, styles.tagLabel]
            return { wrapperStyle, labelStyle }
          },
        },
        {
          label: strings.chat.blocked,
          value: isList ? blocked : false,
          getStyles: () => {
            const wrapperStyle = [styles.wrapperStyle, styles.blockedTag]
            const labelStyle = [
              styles.text,
              styles.adminText,
              styles.blockedLabel,
            ]
            return { wrapperStyle, labelStyle }
          },
        },
      ]
    }, [blocked, isAdmin, isMe, isMod, strings, styles, isList])

    const filteredTags = useMemo(
      () => tagOptions.filter((opt) => opt.value),
      [tagOptions],
    )

    if (_isEmpty(filteredTags)) {
      return null
    }

    return (
      <>
        {_map(filteredTags, ({ label, getStyles }, key) => {
          const { labelStyle, wrapperStyle } = getStyles()
          return (
            <View style={[containerStyleProps, wrapperStyle]} key={key}>
              <Text allowFontScaling={false} style={labelStyle}>
                {label}
              </Text>
            </View>
          )
        })}
      </>
    )
  },
  isEqual,
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    adminTag: {
      backgroundColor: hexToRgbOpacity(theme.memberTypes.admin, 0.2),
    },
    adminText: {
      color: theme.memberTypes.admin,
    },
    blockedLabel: {
      color: theme.memberTypes.blocked,
      fontSize: 10,
      lineHeight: 15,
    },
    blockedTag: {
      borderColor: theme.memberTypes.blocked,
      borderWidth: 1,
    },
    meLabel: {
      color: theme.memberTypes.mine,
      fontSize: 10,
      lineHeight: 15,
    },
    meTag: {
      borderColor: theme.memberTypes.mine,
      borderWidth: 1,
    },
    modTag: {
      backgroundColor: hexToRgbOpacity(theme.memberTypes.mod, 0.2),
    },
    modText: {
      color: theme.memberTypes.mod,
    },
    tagLabel: {
      fontSize: 10,
      lineHeight: 15,
    },
    text: {
      ...theme.text.bodySemiBold,
      fontSize: 12,
      includeFontPadding: false,
      lineHeight: 17,
      paddingHorizontal: UI_SIZE_4,
      textAlignVertical: 'center',
    },
    wrapperStyle: {
      alignItems: 'center',
      borderRadius: 6,
      justifyContent: 'center',
      minHeight: UI_SIZE_16,
      minWidth: UI_SIZE_32,
    },
  })
  return styles
})

export default MemberTag
