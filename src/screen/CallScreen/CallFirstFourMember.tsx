import React, { memo, useCallback, useState } from 'react'
import {
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import isEqual from 'react-fast-compare'

import { createThemedStylesheet } from 'component/theme'
import s, {
  UI_SIZE_8,
  UI_SIZE_16,
  UI_SIZE_24,
  UI_SIZE_120,
} from 'lib/commonStyles'
import { MOBILE_CALL_VIDEO_LIMIT_MEMBERS } from 'lib/constants'
import { useCallCameraStreams } from 'lib/hooks/useStream'

import CallAllMemberButton from './CallAllMemberButton'
import CallMember from './CallMember'
import { CallFirstFourMemberProps, RenderCallMemberProps } from './type'

const CallFirstFourMember = ({
  roomId,
  onShowAllMemberPress,
}: CallFirstFourMemberProps) => {
  const styles = getStyles()
  const { width: windowWidth } = useWindowDimensions()
  const [mySelfInSmallView, setMySelfInSmallView] = useState(true)
  const cameraStreams = useCallCameraStreams()

  const smallViewWidth = (windowWidth - UI_SIZE_16 * 3) / 2

  const renderCallMember = useCallback(
    ({
      isSelf,
      small,
      memberNameLeftAlign,
      memberNameCenterAlign,
      border,
      viewWidth,
      cameraStream,
    }: RenderCallMemberProps) => {
      if (!cameraStream.swarmId) return null

      return (
        <CallMember
          roomId={roomId}
          isSelf={isSelf}
          small={small}
          memberNameLeftAlign={memberNameLeftAlign}
          memberNameCenterAlign={memberNameCenterAlign}
          border={border}
          viewWidth={viewWidth}
          cameraStream={cameraStream}
        />
      )
    },
    [roomId],
  )

  const handleSetMyselfInView = useCallback(
    () => setMySelfInSmallView((value) => !value),
    [],
  )
  const showAllMembers = useCallback(
    () => onShowAllMemberPress?.(true),
    [onShowAllMemberPress],
  )

  return (
    <View style={styles.container}>
      {/* view with 1 member */}
      {cameraStreams.length === 1 &&
        renderCallMember({ isSelf: true, cameraStream: cameraStreams[0] })}
      {/* view with 2 members */}
      {cameraStreams?.length === 2 && (
        <>
          {renderCallMember({
            isSelf: !mySelfInSmallView,
            memberNameLeftAlign: true,
            cameraStream: mySelfInSmallView
              ? cameraStreams[1]
              : cameraStreams[0],
          })}
          <TouchableOpacity
            style={styles.floatMemberContainer}
            onPress={handleSetMyselfInView}
          >
            {renderCallMember({
              isSelf: mySelfInSmallView,
              memberNameLeftAlign: true,
              small: true,
              memberNameCenterAlign: true,
              border: true,
              viewWidth: UI_SIZE_120,
              cameraStream: mySelfInSmallView
                ? cameraStreams[0]
                : cameraStreams[1],
            })}
          </TouchableOpacity>
        </>
      )}
      {/* view with 3-4 members */}
      {cameraStreams.length >= 3 && (
        <View style={[s.container, s.row, s.wrapFlex]}>
          {cameraStreams
            .slice(0, MOBILE_CALL_VIDEO_LIMIT_MEMBERS)
            .map((cameraStream, index) => (
              <View
                style={
                  index === 0 && cameraStreams.length <= 3
                    ? styles.largeMemberContainerFullWidth
                    : styles.largeMemberContainerHalfWidth
                }
                key={index}
              >
                {renderCallMember({
                  isSelf: cameraStream.isSelf,
                  memberNameCenterAlign: true,
                  viewWidth:
                    index === 0 && cameraStreams.length <= 3
                      ? undefined
                      : smallViewWidth,
                  cameraStream,
                })}
              </View>
            ))}
        </View>
      )}
      {cameraStreams.length > MOBILE_CALL_VIDEO_LIMIT_MEMBERS &&
        !!onShowAllMemberPress && (
          <CallAllMemberButton
            count={cameraStreams.length}
            onPress={showAllMembers}
          />
        )}
    </View>
  )
}

export default memo(CallFirstFourMember, isEqual)

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    container: {
      ...s.container,
      paddingHorizontal: UI_SIZE_8,
    },
    floatMemberContainer: {
      bottom: UI_SIZE_8,
      height: 160,
      position: 'absolute',
      right: UI_SIZE_24,
      width: 136,
    },
    largeMemberContainerFullWidth: {
      height: '50%',
      width: '100%',
    },
    largeMemberContainerHalfWidth: {
      height: '50%',
      width: '50%',
    },
  })
  return styles
})
