import { RefObject } from 'react'
import { FlatList, TextStyle } from 'react-native'
import { ImageSize } from 'expo-camera'

// @ts-ignore
import { CHAT_MESSAGE_FORMAT } from '@holepunchto/keet-store/store/chat'

interface Mentions {
  memberId: string
  start: number
  length: number
  pending: boolean
}

export interface DriveFileRaw {
  key: string
  path: string
  version: number
}

export interface ChatEventFileRaw extends DriveFileRaw {
  type: string | null
  preview?: null
  dimensions: {
    width: number
    height: number
  }
  previewPointer: DriveFileRaw | null
}

export interface DisplayFormatFile extends ChatEventFileRaw {
  driveId: string
}

type ChatMessageFormat =
  (typeof CHAT_MESSAGE_FORMAT)[keyof typeof CHAT_MESSAGE_FORMAT]

export type DisplayFormat = {
  start: number
  type: number
  content: string
  length: number
  preview: {
    title: string
    description: string
    url: string
    file: DisplayFormatFile
    icon: string
  }
}

export type Fragment = {
  start: number
  end: number
  styles: Array<{
    type: number
    content: string
  }>
}

export type StyledFragments = Array<Fragment>

export type InViewOffset = {
  top: number
  bottom: number
}

export type InViewIdsOffset = {
  topId: string
  bottomId: string
}

export interface ChatEventType {
  seq: number
  timestamp: number
  id: string
  memberId: string
  coreId: {
    deviceId: string
    memberId: string
    seq: number
  }
  file?: ChatEventFileRaw
  chat?: {
    text: string
    mentions: Array<Mentions>
    edited?: boolean
    display?: DisplayFormat[]
    styledFragments?: StyledFragments
    format?: ChatMessageFormat
  }
  deleted?: boolean
  local: boolean
  datetime?: number
  isHead?: boolean
  hidden?: boolean
  parentId?: string
  groupMemberIds?: Array<string>
  groupSeq?: number
  groupCount?: number
  event?: {
    type: number
    value?: {
      name?: string
      memberKey?: Uint8Array[]
    }
  }
  blocked?: boolean
  replyTo: string
  // used in mobile frontend only
  isUnreadHead?: boolean
  // local append metadata
  isOutOfOrder: boolean
  isTail?: boolean
}

export interface ChatLastMessageType {
  message: {
    seq: number
    timestamp: number
    id: string
    memberId: string
    coreId: {
      deviceId: string
      seq: number
    }
    file?: {
      src: string
      cleared: boolean
      key: string
      path: string
      version: number
      type: string
      preview?: Array<number>
      dimensions: {
        width: number
        height: number
      }
    }
    chat?: {
      text: string
      mentions: Array<Mentions>
      edited: boolean
      format: string
      styledFragments: Array<Fragment>
    }
    deleted: boolean
    local: boolean
    blocked: boolean
    event?: {
      type: number
      value?: {
        name: string
      }
    }
    hidden?: boolean
    reported?: boolean
    reportedByMe?: boolean
  }
  prevSeen: number
  unread: boolean
}

export interface MemberType {
  id: string
  name: string
  displayName?: string
  color?: string
  swarmId: string
  avatarUrl?: string
  canModerate: boolean
  canIndex: boolean
  canWrite: boolean
  capabilities: number
  inCall?: boolean
  isAudioMuted?: boolean
  isConnected?: boolean
  isLocal?: boolean
  blocked?: boolean
  isSpeaking?: boolean
  isVideoMuted?: boolean
  isAdmin?: boolean
  theme?: TextStyle | undefined
  isAnonymous?: boolean
}

export interface RoomMetadata {
  roomId: string
  unread: number
  bookmarked: boolean
}

// etc
export interface OnLayoutEvent {
  nativeEvent: {
    layout: {
      width: number
      height: number
      x: number
      y: number
    }
  }
}

export interface SendFilesInfo {
  uri: string
  type: string
  name: string
  dimensions?: Partial<ImageSize>
  byteLength: number
}

export interface SearchProfile {
  memberId: string
  name: string
  displayName: string
  avatarUrl: string | null
  capabilities?: number
}

/** To Object form to prevent duplicate */
export interface SearchProfileObj {
  [memberid: string]: SearchProfile
}

export interface ReactionsType {
  reactions: { count: number; latest: string[]; text: string }[]
  mine: string[]
  mineInappropriateReported: boolean
  inappropriateMessage: boolean
}

export type FlatListContextType = RefObject<FlatList<ChatEventType>> | null

export interface LinkPreviewType {
  url: string
  title: string
  siteName: string | undefined
  description: string | undefined
  mediaType: string
  contentType: string | undefined
  images: string[]
  videos?: {
    url: string | undefined
    secureUrl: string | null | undefined
    type: string | null | undefined
    width: string | undefined
    height: string | undefined
  }[]
  favicons: string[]
}

export type ImageDimensions = {
  height: number
  width: number
}
