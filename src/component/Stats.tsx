import React, { memo, useCallback, useEffect, useMemo } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import prettyBytes from 'pretty-bytes'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import _filter from 'lodash/filter'
import _orderBy from 'lodash/orderBy'

import {
  disableStats,
  enableStats,
  getStats,
  getStatsRaw,
  StatsRaw,
} from '@holepunchto/keet-store/store/stats'

import {
  getCollapseStats,
  getIsAppBackgrounded,
  getIsStatsExpanded,
  getShowStats,
  setCollapseStats,
  setStatsExpanded,
} from 'reducers/application'

import s, {
  ICON_SIZE_16,
  UI_SIZE_6,
  UI_SIZE_8,
  UI_SIZE_12,
  UI_SIZE_20,
} from 'lib/commonStyles'
import { STATS_EXPANDED_MAX_HEIGHT } from 'lib/constants'
import { useDeepEqualSelector } from 'lib/hooks/useDeepEqualSelector'
import {
  getIsTimeStatsEnabled,
  setStorageStatsCollapsed,
} from 'lib/localStorage'

import SvgIcon from './SvgIcon'
import { colors, createThemedStylesheet } from './theme'

const BOOT_DATE_TIME = new Date(Date.now()).toUTCString()

const normaliseCpuUsage = (cpuUsage: number) =>
  `${Math.round(cpuUsage * 1000) / 10}%`

export const StatsToggleIcon = memo(({ iconUp }: { iconUp: boolean }) => {
  const { top } = useSafeAreaInsets()
  const styles = getStyles()

  const dispatch = useDispatch()
  const collapseStats = useSelector(getCollapseStats)

  const handleMinimize = useCallback(() => {
    dispatch(setCollapseStats(!collapseStats))
    setStorageStatsCollapsed(!collapseStats)
  }, [collapseStats, dispatch])

  return (
    <View style={[styles.minimizedContainer, { top }]}>
      <TouchableOpacity
        onPress={handleMinimize}
        style={styles.iconContainer}
        hitSlop={20}
      >
        <SvgIcon
          name="chevronRight"
          color={colors.white_snow}
          style={iconUp ? styles.chevronUp : styles.chevronBottom}
          width={ICON_SIZE_16}
          height={ICON_SIZE_16}
        />
      </TouchableOpacity>
    </View>
  )
})

const Stats = memo(() => {
  const styles = getStyles()

  const statsData = useDeepEqualSelector(getStats)
  const rawStats: StatsRaw = useSelector(getStatsRaw)
  const isAppBackgrounded = useSelector(getIsAppBackgrounded)
  const { top } = useSafeAreaInsets()

  const dispatch = useDispatch()
  const showStats = useSelector(getShowStats)
  const collapseStats = useSelector(getCollapseStats)
  const isStatsExpanded = useSelector(getIsStatsExpanded)

  useEffect(() => {
    if (!collapseStats || !showStats || isAppBackgrounded) {
      dispatch(disableStats())
    } else {
      const timer = setTimeout(
        () => dispatch(enableStats()),
        getIsTimeStatsEnabled() ? 5000 : 500, // When timestats enabled some delay needed as action will be dispatched earlier.
      )
      return () => clearTimeout(timer)
    }
  }, [collapseStats, dispatch, isAppBackgrounded, showStats])

  const handlePress = useCallback(() => {
    dispatch(setStatsExpanded(!isStatsExpanded))
  }, [dispatch, isStatsExpanded])

  const cpuUsage = useMemo(() => {
    const bare = _filter(rawStats?.threads, { bare: true })
    if (!bare.length) return '-'
    return normaliseCpuUsage(bare?.[0]?.cpuUsage)
  }, [rawStats?.threads])

  const [maxRss, heapUsed, heapTotal, external] = useMemo(
    () => [
      prettyBytes(rawStats?.maxRSS ?? 0) || '-',
      prettyBytes(rawStats?.memory?.heapUsed ?? 0),
      prettyBytes(rawStats?.memory?.heapTotal ?? 0),
      prettyBytes(rawStats?.memory?.external ?? 0),
    ],
    [
      rawStats?.maxRSS,
      rawStats?.memory?.external,
      rawStats?.memory?.heapTotal,
      rawStats?.memory?.heapUsed,
    ],
  )

  const performanceMetricsData = useMemo(
    () => ({
      'Bare CPU': cpuUsage,
      Rooms: statsData?.Rooms,
      Cores: statsData?.Cores,
      MaxRSS: maxRss,
      Heap: `U: ${heapUsed} T: ${heapTotal} E: ${external}`,
    }),
    [
      cpuUsage,
      external,
      heapTotal,
      heapUsed,
      maxRss,
      statsData?.Cores,
      statsData?.Rooms,
    ],
  )

  const tableData: any = useMemo(
    () => Object.assign(performanceMetricsData, statsData),
    [performanceMetricsData, statsData],
  )

  const threads = useMemo(
    () => _orderBy(rawStats.threads, 'cpuUsage', 'desc'),
    [rawStats.threads],
  )

  return (
    <View
      style={[
        styles.root,
        isStatsExpanded && styles.viewExpanded,
        { paddingTop: top },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsHorizontalScrollIndicator={false}
        horizontal={!isStatsExpanded}
      >
        <Pressable
          style={[s.row, isStatsExpanded && s.wrapFlex]}
          onLongPress={handlePress}
        >
          {Object.keys(tableData).map((title, index) => {
            return (
              <View
                style={[
                  styles.containerPadding,
                  s.flexGrow,
                  isStatsExpanded && styles.toggledContainer,
                  index === 0 && styles.firstItem,
                ]}
                key={title + index}
              >
                <Text style={styles.title}>{title}</Text>
                <View style={s.row}>
                  {typeof tableData[title] === 'object' ? (
                    Object.keys(tableData[title]).map((row, rowIndex) => {
                      return (
                        <Text
                          style={[styles.desc, styles.paddingRight]}
                          key={rowIndex}
                        >
                          {row}: {tableData[title][row]}
                        </Text>
                      )
                    })
                  ) : (
                    <Text
                      style={[
                        styles.desc,
                        styles.paddingRight,
                        title === 'Cpu' ? styles.descSmall : styles.descBig,
                      ]}
                      key={tableData[title]}
                    >
                      {tableData[title]}
                    </Text>
                  )}
                </View>
              </View>
            )
          })}
          <View style={[styles.containerPadding, s.flexGrow]}>
            <Text style={styles.title}>Boot date time</Text>
            <View style={s.row}>
              <Text style={[styles.desc, styles.paddingRight]}>
                {BOOT_DATE_TIME}
              </Text>
            </View>
          </View>
          {isStatsExpanded && (
            <>
              <View style={[styles.containerPadding, s.flexGrow]}>
                <Text style={styles.title}>IPC</Text>
                <View style={s.row}>
                  <Text style={[styles.desc, styles.paddingRight]}>
                    Recv: {rawStats?.ipc?.recv}
                  </Text>
                  <Text style={[styles.desc, styles.paddingRight]}>
                    Sent: {rawStats?.ipc?.sent}
                  </Text>
                </View>
              </View>
              <View style={[styles.containerPadding, styles.toggledContainer]}>
                <Text style={styles.title}>CPU Usage by threads</Text>
                <Text style={[styles.desc, styles.paddingRight]}>
                  <View style={styles.threads}>
                    <Text style={styles.title}>ID</Text>
                    <Text style={styles.title}>CPU Usage</Text>
                  </View>
                  {threads?.map((thread) => (
                    <View style={styles.threads} key={thread.id}>
                      <Text style={styles.desc}>{thread.id}</Text>
                      <Text style={styles.desc}>
                        {normaliseCpuUsage(thread.cpuUsage)}
                      </Text>
                    </View>
                  ))}
                </Text>
              </View>
              <View style={[styles.containerPadding, styles.toggledContainer]}>
                <Text style={styles.title}>Background swarming rooms</Text>
                <Text style={[styles.desc, styles.paddingRight]}>
                  {rawStats.backgroundSwarmingRooms
                    ?.toString()
                    .replaceAll(',', '\n')}
                </Text>
              </View>
              <View style={[styles.containerPadding, styles.toggledContainer]}>
                <Text style={styles.title}>Room subscriptions</Text>
                <Text style={[styles.desc, styles.paddingRight]}>
                  {rawStats.roomSubscriptions?.toString()}
                </Text>
              </View>
            </>
          )}
        </Pressable>
      </ScrollView>
    </View>
  )
})

export default Stats

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    chevronBottom: {
      transform: [{ rotateZ: '90deg' }],
    },
    chevronUp: {
      transform: [{ rotateZ: '-90deg' }],
    },
    container: {
      paddingBottom: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_8,
    },
    containerPadding: {
      paddingRight: UI_SIZE_12,
    },
    desc: {
      color: colors.white_snow,
    },
    descBig: {
      minWidth: 80,
    },
    descSmall: {
      minWidth: 50,
    },
    firstItem: {
      paddingLeft: UI_SIZE_20,
    },
    iconContainer: {
      ...s.centeredLayout,
      backgroundColor: theme.color.grey_600,
      borderBottomRightRadius: UI_SIZE_8,
      borderColor: theme.color.grey_400,
      borderLeftWidth: 0,
      borderTopRightRadius: UI_SIZE_8,
      borderWidth: 1,
      height: 40,
      width: UI_SIZE_20,
    },
    minimizedContainer: {
      left: 0,
      position: 'absolute',
      zIndex: 2,
    },
    paddingRight: {
      paddingRight: UI_SIZE_6,
    },
    root: {
      backgroundColor: theme.background.bg_1,
    },
    threads: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '80%',
    },
    title: {
      ...theme.text.bodyBold,
      color: colors.white_snow,
    },
    toggledContainer: {
      marginBottom: UI_SIZE_12,
    },
    viewExpanded: {
      maxHeight: STATS_EXPANDED_MAX_HEIGHT,
    },
  })

  return styles
})
