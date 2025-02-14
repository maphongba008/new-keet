import { GranularPermission } from 'expo-media-library'
import Config from 'react-native-config'
import { type Edge } from 'react-native-safe-area-context'

import { CALL_VIDEO_LIMIT_MEMBERS_GTE } from '@holepunchto/keet-store/store/call'
import { MemberCapabilities } from '@holepunchto/keet-store/store/member'

import { isIOS } from './platform'

export const APPLICATION_KEY = __DEV__ ? 'dev' : 'keet'
export const PEAR_PROTOCOL = Config.KEET_SCHEME_PEAR
export const ROOM_URL_PREFIX = `${PEAR_PROTOCOL}://`

export const CUSTOM_LINK_PROTOCOLS = ['holepunch://', 'punch://', PEAR_PROTOCOL]

// APP specific URLs
export const SUPPORT_URL = `${ROOM_URL_PREFIX}keet/yry7g7wa7bmrjd1xxr7ce64581ij3hozq7589xfgxjrm74kgp34o36pwp46ohw4u1w63o6is6sax6j3swgdi66dmti8p8nfuyypfwewbuy`
export const NEWS_URL = `${ROOM_URL_PREFIX}keet/yry5dqgiy967ffrrbi973ghfb4wsbtczezsomgp4z8s8nn68eyg5kgdyjc1b7dh4gbxkh9apmzn8szr3wdyosa8bdbmja47pp48pjmf7dh`
export const TWITTER_URL = 'https://twitter.com/keet_io'

export const KEET_URL = 'https://keet.io/'

export const CSAM_REPORT_URL = 'https://projectcport.com/report/'

// Push URL
export const ROOM_PUSH_URL_PREFIX = `${ROOM_URL_PREFIX}push/`
export const SHARE_CONTENT_URL = 'shareContentURL'
export const KEET_URL_PREFIX = `${Config.KEET_SCHEME_KEET}://`

export const INVITE_DURATION = {
  HOURS: '2h',
  DAYS: '2d',
  WEEKS: '2w',
  PERMANENT: '0',
}

// APP UI
export const SAFE_EDGES: readonly Edge[] = ['left', 'right', 'bottom']
export const BACK_DEBOUNCE_DELAY = 500
export const BACK_DEBOUNCE_OPTIONS = { leading: true, trailing: false }
export const BOTTOM_SHEET_ANIMATION_DURATION = 250
export const BOTTOM_SHEET_ANIMATION_REPLACE_TIMEOUT = 100

export const MAX_FONT_SIZE_MULTIPLIER = 1.5

export const CAPABILITIES = {
  CAN_WRITE: Number.parseInt(MemberCapabilities.CAN_WRITE, 10),
  CAN_INDEX: Number.parseInt(MemberCapabilities.CAN_INDEX, 10),
  CAN_MODERATE: Number.parseInt(MemberCapabilities.CAN_MODERATE, 10),
}

export const IGNORE_LOGS = [
  /^You seem to update pro/,
  /^Key "cancelled" in the/,
  /^Failed to get size/,
  '[Reanimated] Reading from `value` during component render. Please ensure that you do not access the `value` property or use `get` method of a shared value while React is rendering a component.',
]

// ROOM
export const LOBBY_PAGINATION_SCROLL_DEBOUNCE = 30
export const LOBBY_DECELERATION_RATE = isIOS ? 0.95 : 0.9
export const VIEWABLE_ITEM_DEBOUNCE_OPTIONS = { leading: false, trailing: true }
export const VIEWABLE_ITEM_DURATION = 200

// ROOM OPTION
export const ROOM_DEBUG_MENU_PASSWORD = 'thecakeisalie'
export const STATS_EXPANDED_MAX_HEIGHT = 300
export const STATS_MAX_TAPS = 10

// Profile
export const PROFILE_NAME_CHAR_LIMIT = 22

// CHAT
export const INPUT_DEBOUNCE_WAIT_TIME = 300
export const INPUT_DEBOUNCE_OPTIONS = { leading: false, trailing: true }

export const INVIEW_ITEMS_COUNT = 15

export const CHAT_BUBBLE_MAX_CHAR = 1500
export const QUOTE_NEST_LAYERS = 1

const PREVIEW_WIDTH = 50
const LINK_PREVIEW_WIDTH = 150

export const CHAT_INPUT_PREVIEW = {
  UNKNOWN_WIDTH: 150,
  PREVIEW_WIDTH,
  PREVIEW_HEIGHT: PREVIEW_WIDTH,
  LOADER_SIZE: PREVIEW_WIDTH / 2,
  LINK_PREVIEW_WIDTH,
  LINK_PREVIEW_HEIGHT: LINK_PREVIEW_WIDTH / 3,
}

// CALL
export const REMOTE_SYNC_DELAY = 1000

// MEDIA
export const GALLERY_WRITE_ONLY_MEDIA = false
export const GALLERY_GRANULAR_PERMISSION: GranularPermission[] = [
  'photo',
  'video',
]
export const MAX_SHARE_COUNT = 10

export const MOBILE_CALL_VIDEO_LIMIT_MEMBERS = CALL_VIDEO_LIMIT_MEMBERS_GTE - 1

export const WAVEFORM_HEIGHT = 30
export const WAVEFORM_MIN_HEIGHT = 2
export const WAVEFORM_SPACE = 0.2

export const DEFAULT_SVG_DIMENSIONS = {
  width: 800,
  height: 800,
}

export const ONE_SECOND_IN_MILLISECONDS = 1000
export const ONE_MINUTE_IN_MILLISECONDS = ONE_SECOND_IN_MILLISECONDS * 60
export const ONE_HOUR_IN_MILLISECONDS = ONE_MINUTE_IN_MILLISECONDS * 60

export const MOBILE_AUDIO_MAX_DURATION_TO_GET_WAVEFORM =
  ONE_MINUTE_IN_MILLISECONDS * 5 // 5 Minutes
export const MOBILE_AUDIO_MAX_BYTE_TO_GET_WAVEFORM = 10 ** 6 * 10 // 10 MB

export const NO_PERMISSION = 'NO_PERMISSION'
