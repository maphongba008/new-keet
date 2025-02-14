import React, { memo, useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'
import _get from 'lodash/get'

import { getAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  getRoomLastPairing,
  PAIRING_STATUS,
} from '@holepunchto/keet-store/store/room'

import { KeetLoading, Loading } from 'component/Loading'
import RoomBackground from 'component/RoomBackground'
import { createThemedStylesheet } from 'component/theme'
import { DMConfigProp } from 'screen/DMRequestsScreen/DMRequests.Item'
import s, { ICON_SIZE_90, width } from 'lib/commonStyles'
import { getMemberRoleName } from 'lib/hooks/useMember'

import { useStrings } from 'i18n/strings'

import { RoomScreenRefProvider } from './ContextProvider/RoomScreenRefProvider'
import useRoomCleanup from './hooks/useRoomCleanup'
import RoomScreen from './RoomScreen'

interface RoomScreenProps {
  joinCall: boolean
  dmConfig: DMConfigProp
}

const RoomScreenContainer = ({ route }: any) => {
  const { joinCall, dmConfig }: RoomScreenProps = _get(route, 'params', {})
  const styles = getStyles()
  const {
    chat: { dm: strings },
  } = useStrings()

  useRoomCleanup()

  const roomId = useSelector(getAppCurrentRoomId)
  const lastPairingRoomData = useSelector(getRoomLastPairing)
  const isPairingPending = useMemo(
    () => lastPairingRoomData?.status !== PAIRING_STATUS.COMPLETED,
    [lastPairingRoomData],
  )

  const dmContextLabel = useMemo(() => {
    const memberDisplayName = dmConfig?.member?.displayName || ''
    const prepareLbl = strings.prepareDm_1.replace('$0', memberDisplayName)
    const roomTitleLbl = strings.prepareDm_2.replace('$0', dmConfig?.roomTitle)
    const senderRole = getMemberRoleName(dmConfig?.member)

    return `${prepareLbl}, ${senderRole} ${roomTitleLbl}`
  }, [dmConfig, strings])

  // add context message when joining DM room for better UX
  // https://app.asana.com/0/1208335742999836/1208856524284292/f
  if (dmConfig && isPairingPending) {
    return (
      <RoomBackground centeredLayout>
        <View style={{ height: ICON_SIZE_90 }}>
          <KeetLoading />
        </View>
        <Text style={styles.prepareDM}>{dmContextLabel}</Text>
      </RoomBackground>
    )
  }

  if (!roomId) {
    return (
      <RoomBackground centeredLayout>
        <Loading />
      </RoomBackground>
    )
  }

  return (
    <RoomScreenRefProvider>
      <RoomBackground>
        <RoomScreen joinCall={joinCall} />
      </RoomBackground>
    </RoomScreenRefProvider>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    prepareDM: {
      ...theme.text.bodySemiBold,
      ...s.textAlignCenter,
      lineHeight: 30,
      paddingHorizontal: 0.18 * width,
    },
  })
  return styles
})

export default memo(RoomScreenContainer)
