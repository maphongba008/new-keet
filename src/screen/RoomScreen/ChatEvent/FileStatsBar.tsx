import React, { memo } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet, useTheme } from 'component/theme'
import s, {
  DIRECTION_CODE,
  ICON_SIZE_16,
  ICON_SIZE_20,
  UI_SIZE_4,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_20,
} from 'lib/commonStyles'

import { useStrings } from 'i18n/strings'

import { useFileStatsLocalized } from './hooks/useFileStatsLocalized'

interface FileStatsBarProps {
  fileId: string
  isWithStreamingLabel?: boolean
}

export const STATS_BAR_HEIGHT = UI_SIZE_20

export const FileStatsBar = memo(
  ({ fileId, isWithStreamingLabel }: FileStatsBarProps) => {
    const { downloadSpeed, uploadSpeed, peersCount, isDownloading } =
      useFileStatsLocalized(fileId)
    const styles = getStyles()
    const theme = useTheme()
    const strings = useStrings()
    const isStreaming = isWithStreamingLabel && isDownloading

    return (
      <View style={styles.container}>
        {isStreaming ? (
          <View style={styles.steamingTitleContainer}>
            <SvgIcon
              color={theme.color.blue_400}
              name="liveSpace"
              width={ICON_SIZE_20}
              height={ICON_SIZE_20}
              style={styles.statusIcon}
            />
            <Text style={styles.steamingTitle}>{strings.chat.streaming}</Text>
          </View>
        ) : (
          <View style={styles.steamingTitleContainer} />
        )}

        <View style={s.row}>
          <SvgIcon
            color={theme.color.grey_000}
            name="download"
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
            style={styles.statusIcon}
          />
          <Text style={styles.status}>{downloadSpeed}</Text>
        </View>

        <View style={s.row}>
          <SvgIcon
            color={theme.color.grey_000}
            name="upload"
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
            style={styles.statusIcon}
          />
          <Text style={styles.status}>{uploadSpeed}</Text>
        </View>

        <View style={s.row}>
          <SvgIcon
            color={theme.color.grey_000}
            name="usersThree"
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
            style={styles.statusIcon}
          />
          <Text style={styles.status}>{peersCount}</Text>
        </View>
      </View>
    )
  },
)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      borderRadius: UI_SIZE_4,
      flexDirection: 'row',
      gap: UI_SIZE_16,
      height: STATS_BAR_HEIGHT,
      paddingHorizontal: UI_SIZE_8,
    },
    status: {
      ...theme.text.bodySemiBold,
      color: theme.color.grey_000,
      fontSize: 12,
      paddingHorizontal: UI_SIZE_4,
      textAlign: 'center',
      writingDirection: DIRECTION_CODE,
    },
    statusIcon: {
      marginRight: UI_SIZE_4,
    },
    steamingTitle: {
      ...theme.text.bodySemiBold,
      color: colors.blue_400,
      fontSize: 13,
    },
    steamingTitleContainer: {
      flex: 1,
      flexDirection: 'row',
    },
  })
  return styles
})
