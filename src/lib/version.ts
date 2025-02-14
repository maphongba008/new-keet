import * as Application from 'expo-application'
import { checkVersion } from 'react-native-check-version'

import { FORCE_UPGRADE_BANNER, SHOW_UPDATE_BANNER } from './build.constants'

export const bundleId = Application.applicationId || undefined

const currentVersion = Application.nativeApplicationVersion || undefined

export interface Update {
  needsUpdate: boolean
  isMandatory: boolean
  url: string | null
}
type GetVersion = () => Promise<false | Update>

export const checkForVersionUpdate: GetVersion = async () => {
  if (!SHOW_UPDATE_BANNER) return false
  try {
    const version = await checkVersion({
      bundleId,
      currentVersion,
    })
    return {
      isMandatory: FORCE_UPGRADE_BANNER,
      needsUpdate: version?.needsUpdate,
      url: version?.url,
    }
  } catch {
    return false
  }
}
