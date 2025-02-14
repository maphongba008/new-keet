import React, { memo, useCallback, useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import isEqual from 'react-fast-compare'
import { Zoom } from 'react-native-reanimated-zoom'

import { HolepunchWebRTCVideoView } from '@holepunchto/webrtc'

import { IconButton } from 'component/Button'
import SvgIcon from 'component/SvgIcon'
import { colors, createThemedStylesheet } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import s, {
  ICON_SIZE_16,
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_32,
} from 'lib/commonStyles'
import { useMember } from 'lib/hooks/useMember'
import {
  lockScreenPortraitUpAsync,
  unlockScreenAsync,
} from 'lib/screenOrientation'

import CallAllMembersNew from './CallAllMembersNew'
import { CallMemberNameWithIcon } from './CallMemberName'
import { CallSharedScreenProps } from './type'

const CallSharedScreen = ({
  roomId,
  streamTrackId,
  streamMemberId,
}: CallSharedScreenProps) => {
  const { member: sharedScreenMember } = useMember(roomId, streamMemberId)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    return () => {
      lockScreenPortraitUpAsync()
      setExpanded(false)
    }
  }, [setExpanded])

  const toggleExpanded = useCallback(() => {
    setExpanded((_expanded) => {
      if (!_expanded) {
        unlockScreenAsync()
      } else {
        lockScreenPortraitUpAsync()
      }

      return !_expanded
    })
  }, [setExpanded])

  const styles = getStyles()

  if (!streamTrackId) return null

  return (
    <View style={s.container}>
      <View style={styles.sharedScreenContainer}>
        <View style={[s.overflowHidden, styles.sharedScreenRTCContainer]}>
          <Zoom style={s.container}>
            <HolepunchWebRTCVideoView
              trackId={streamTrackId}
              style={styles.sharedScreenRTCContainer}
            />
          </Zoom>
        </View>
        <IconButton
          style={styles.resizeButton}
          onPress={toggleExpanded}
          testID={APPIUM_IDs.call_shared_screen_expand_button}
        >
          <SvgIcon
            color={colors.keet_grey_100}
            name={
              expanded
                ? 'arrowDownLeftAndArrowUpRightToCenter'
                : 'arrowUpRightAndArrowDownLeftFromCenter'
            }
            width={ICON_SIZE_16}
            height={ICON_SIZE_16}
          />
        </IconButton>
        <CallMemberNameWithIcon
          member={sharedScreenMember}
          isMuted={false}
          roomId={roomId}
        />
      </View>
      {!expanded && (
        <CallAllMembersNew roomId={roomId} style={styles.allMembersContainer} />
      )}
    </View>
  )
}

export default memo(CallSharedScreen, isEqual)

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    allMembersContainer: {
      marginTop: UI_SIZE_8,
    },
    resizeButton: {
      backgroundColor: theme.background.bg_2,
      borderRadius: UI_SIZE_8,
      height: undefined,
      padding: UI_SIZE_16,
      position: 'absolute',
      right: UI_SIZE_16,
      top: UI_SIZE_16,
      width: undefined,
    },
    sharedScreenContainer: {
      borderColor: theme.border.color,
      borderRadius: UI_SIZE_32,
      borderWidth: theme.border.width,
      flex: 1,
      marginHorizontal: UI_SIZE_16,
    },
    sharedScreenRTCContainer: {
      borderRadius: UI_SIZE_32,
      flex: 1,
    },
  })
  return styles
})
