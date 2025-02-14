import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { CloseButton } from 'component/CloseButton'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import s, {
  DIRECTION_CODE,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_14,
  UI_SIZE_18,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

export interface ChannelRoomTipsProps {
  title: string
  onConfirmChannel: () => void
}

type OptionType = {
  label: string
  icon: any
}[]

function ChannelRoomTips({ title, onConfirmChannel }: ChannelRoomTipsProps) {
  const styles = getStyles()
  const strings = useStrings()

  const options: OptionType = [
    { label: strings.room.channelRoomTips.label1, icon: 'userPlus' },
    { label: strings.room.channelRoomTips.label2, icon: 'video' },
    { label: strings.room.channelRoomTips.label3, icon: 'paperPlane' },
    { label: strings.room.channelRoomTips.label4, icon: 'checkCircle' },
  ]

  return (
    <View>
      <CloseButton
        onPress={onConfirmChannel}
        style={styles.close}
        width={UI_SIZE_18}
        height={UI_SIZE_18}
        color={colors.keet_grey_200}
      />
      <Text style={styles.onboardTitle}>
        {strings.room.channelRoomTips.title.replace('$1', title)}
      </Text>
      <Text style={styles.onboardMeta}>
        {strings.room.channelRoomTips.description}
      </Text>
      {options.map((data, i) => (
        <View key={i} style={styles.listWrapper}>
          <View style={[s.row, s.alignItemsCenter]}>
            <SvgIcon
              name={data.icon}
              width={UI_SIZE_18}
              height={UI_SIZE_18}
              color={colors.white_snow}
            />
            <View style={styles.textWrapper}>
              <Text style={styles.listLabel}>{data.label}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    close: {
      ...s.alignSelfEnd,
      marginBottom: UI_SIZE_8,
      marginTop: -UI_SIZE_8,
    },
    listLabel: {
      ...theme.text.bodySemiBold,
    },
    listWrapper: {
      ...s.row,
      ...s.alignItemsCenter,
      ...s.flexSpaceBetween,
      borderRadius: 12,
      marginBottom: theme.spacing.normal + UI_SIZE_4,
    },
    onboardMeta: {
      ...theme.text.body,
      color: theme.color.grey_300,
      fontSize: UI_SIZE_14,
      marginBottom: theme.spacing.standard + UI_SIZE_4,
      writingDirection: DIRECTION_CODE,
    },
    onboardTitle: {
      ...theme.text.bodySemiBold,
      marginBottom: theme.spacing.normal - 6,
      writingDirection: DIRECTION_CODE,
    },
    textWrapper: {
      marginLeft: UI_SIZE_12,
    },
  })
  return styles
})

export default memo(ChannelRoomTips)
