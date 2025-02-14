import { useSelector } from 'react-redux'

import { FEATURES, isFeatureSupported } from '@holepunchto/keet-core-api'
import { getRoomItemById } from '@holepunchto/keet-store/store/room'

export const useIsFeatureSupported = (roomId: string, feature: FEATURES) => {
  const room = useSelector(
    getRoomItemById(roomId),
    (prev, next) => prev?.version === next?.version,
  )
  return isFeatureSupported(room?.version, feature)
}

export const useIsDmSupported = (roomId: string) =>
  useIsFeatureSupported(roomId, FEATURES.DMS)

export const useIsDowngradeSupported = (roomId: string) =>
  useIsFeatureSupported(roomId, FEATURES.PERMISSION_DOWNGRADE)

export const useIsRemoveMemberSupported = (roomId: string) =>
  useIsFeatureSupported(roomId, FEATURES.REMOVE_MEMBER)

export const useIsMemberMuteSupported = (roomId: string) =>
  useIsFeatureSupported(roomId, FEATURES.MUTE_MEMBER)
