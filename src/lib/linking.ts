import { Linking } from 'react-native'

// @ts-ignore
import { MENTION_URL_PREFIX } from '@holepunchto/keet-store/store/chat'
import { parseInvitation } from '@holepunchto/keet-store/store/room'

import { PEAR_PROTOCOL, ROOM_URL_PREFIX } from 'lib/constants'

import { getStrings } from 'i18n/strings'

export const openKeetTerms = async () =>
  await Linking.openURL(getStrings().url.terms)

export const makeRoomUrl = (url: string) => `${ROOM_URL_PREFIX}${url}`
export const isRoomUrl = (url: string): boolean =>
  typeof url === 'string' &&
  url.indexOf(ROOM_URL_PREFIX) === 0 &&
  Boolean(parseInvitation(url, PEAR_PROTOCOL))

const MENTION_URL_PREFIX_DEPRECATED = 'mention://'
const ALLOWED_URL_PREFIXES = [
  ROOM_URL_PREFIX,
  MENTION_URL_PREFIX,
  MENTION_URL_PREFIX_DEPRECATED,
  'http://',
  'https://',
]
export const sanitizeURL = (href: string) => {
  const sanitizedUrl = !ALLOWED_URL_PREFIXES.some((p) =>
    href?.toLowerCase().startsWith(p),
  )
  return sanitizedUrl ? '' : href
}

export const openLink = (url: string) =>
  Linking.canOpenURL(url)
    .then(() => {
      Linking.openURL(url)
    })
    .catch(() => {
      import('./hud').then((module) => {
        module.showErrorNotifier(`can't open ${url}`, false)
      })
    })

export const processAppLink = (markdown: string) => {
  return markdown
    .split(' ')
    .map((word) =>
      isRoomUrl(word.trim()) ? `[${word}](${word.trim()})` : word,
    )
    .join(' ')
}
