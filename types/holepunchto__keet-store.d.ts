declare module '@holepunchto/keet-store' {
  import { Store } from '@reduxjs/toolkit'

  export default function createStore(): Store & {
    setBackend: (backend: any) => void
  }
}
type ICoreEventId = {
  deviceId: string
  seq: number
}
declare module '@holepunchto/keet-store/store/app' {
  import { ActionCreatorWithPayload } from '@reduxjs/toolkit'

  export const APP_STATUS: {
    LOADING: string
    RUNNING: string
    IDENTITY_SETUP: string
    TEARDOWN: string
  }
  export const APP_UPDATE_REASONS: {
    APP_UPGRADE: string
    ROOM_UPGRADE: string
  }
  export const appSlice: any
  export const setAppCurrentCallRoomId: (roomId: string) => any
  export const getAppState: (state: any) => any
  export const setAppStatus: ActionCreatorWithPayload<string>
  export const getAppStatus: (state: any) => string
  export const setAppCurrentRoomId: ActionCreatorWithPayload<{
    roomId: string
    messageId?: ICoreEventId
  }>
  export const getAppCurrentRoomId: (state: any) => string
  export const getAppCurrentCallRoomId: (state: any) => string
  export const isOngoingCallByRoomId: (state: any, roomId: string) => boolean
  export const hasAppCurrentRoomCallMatch: (state: any) => boolean
  export const setAppNotificationsType: ActionCreatorWithPayload<string>
  export const appCallManagerSaga: () => void
  export const appRootFunctionalitySaga: (value: string) => void
  export const getUpdateReason: (state: any) => string
  export const getUpdateRequired: (state: any) => boolean
  export const appRoomJoinSaga: (action: any) => void
  export const appDmResponseSaga: (action: any) => void
}

declare module '@holepunchto/keet-store/store/room/room.constants' {
  export const ROOM_TYPE: { ROOM: string; BROADCAST: string; DM: string }
  export const ROOM_STATE_KEY: 'room'
  export const EMPTY_ROOM_ID: ''
  export enum ROOM_TYPE_FILTER {
    ALL,
    DM,
    GROUP,
    BROADCAST,
  }
}
declare module '@holepunchto/keet-store/store/lib/string' {
  export const getFirstLetters: (name: string) => string
}
declare module '@holepunchto/keet-store/store/room/list/room-list.constants' {
  export const ROOM_LIST_STATE_KEY: 'list'
}

declare module '@holepunchto/keet-store/store/room' {
  import { InViewOffset } from 'lib/types'
  import {
    ActionCreatorWithPayload,
    ActionCreatorWithoutPayload,
    Slice,
  } from '@reduxjs/toolkit'
  import { FilePointer } from '@holepunchto/keet-store/store/media/file'
  export {
    ROOM_STATE_KEY,
    ROOM_TYPE,
    ROOM_TYPE_FILTER,
    EMPTY_ROOM_ID,
  } from '@holepunchto/keet-store/store/room/room.constants'
  export { ROOM_LIST_STATE_KEY } from '@holepunchto/keet-store/store/room/list/room-list.constants'
  export interface RoomFileRaw extends FilePointer {
    cleared?: boolean
    mimeType?: string
  }
  export enum PAIRING_STATUS {
    NEW = 'new',
    PAIRED = 'paired',
    COMPLETED = 'completed',
    EXPIRED = 'expired',
    ASKED = 'asked',
    CANCELLED = 'cancelled',
  }
  export interface PairingRoom {
    discoveryId: string
    expires: number
    roomId: string
    seedId: string
    status: PAIRING_STATUS
  }
  export interface ClearPairingRoom {
    seedId: string
    status: PAIRING_STATUS
  }
  export const ROOM_NAME_MAX_LENGTH: number

  export type DMItem = {
    id: string
    seq: number
    type: number
    seen: boolean
    roomId: string
    senderId: string
    invitation: string
    message: string
    timestamp: number
    status: number
  }

  export enum ROOM_DM_REPLY {
    ACCEPT,
    REJECT,
    BLOCK,
  }

  export const getDmRequestBySenderId: (
    memberId: string,
  ) => (state: any) => DMItem
  export const getDmRejectedBySenderId: (
    memberId: string,
  ) => (state: any) => DMItem
  export const dmReplySubmit: (reply: ROOM_DM_REPLY, invitation: string) => any
  export const dmRequestSubmit: (memberId: string, message: string) => any
  export const getDmRequests: (state: any) => DMItem[]
  export const getIsDmSentToMember: (
    memberId: string,
  ) => (state: any) => boolean
  export const getDmRoomByMemberId: (memberId: string) => (state: any) => string
  export const setDmActiveId: ActionCreatorWithPayload<string>
  export const setAllRooms: (state: any) => any
  export const getRoomListIsSearching: (state: any) => boolean
  export const getRoomListIsLoading: (state: any) => boolean
  export const getRoomListIsError: (state: any) => boolean
  export const getRoomListInView: (state: any) => InViewOffset
  export const getRoomListActualIds: (state: any) => string[]
  export const getRoomListSearchIds: (state: any) => string[]
  export const getRoomListSearchActive: (state: any) => boolean
  export const getInViewOffset: (state: any) => InViewOffset
  export const sortRoomBy: (state: string) => any
  export const setItemsInView: (state: InViewOffset) => any
  export const getRoomListSearchText: (state: any) => string
  export const getRoomListIsCache: (state: any) => boolean
  export const getHasCompatibleRooms: (state: any) => boolean
  export const getRoomIsCompatible: (roomId: string) => (state: any) => boolean
  export const getRoomLeavingDirty: (roomId: string) => (state: any) => boolean
  export const getInvitationMessageId: (
    invitation: string,
  ) => (state: any) => string
  export const ROOM_INFO_FILES_TAB: {
    MEDIA: 'media'
    AUDIO: 'audio'
    DOCS: 'docs'
  }
  type ROOM_INFO_FILES_TAB_KEY = keyof typeof ROOM_INFO_FILES_TAB
  export type ROOM_INFO_FILES_TAB_VALUE =
    (typeof ROOM_INFO_FILES_TAB)[ROOM_INFO_FILES_TAB_KEY]
  export const ROOM_INFO_FILES_PER_ROW: Record<ROOM_INFO_FILES_TAB_KEY, number>
  export const getRoomInfoFilesTab: (state: any) => ROOM_INFO_FILES_TAB_VALUE
  export const getRoomInfoFiles: (state: any) => RoomFileRaw[]
  export const getRoomInfoFilesInViewRange: (state: any) => InViewOffset
  export const setRoomInfoFilesInViewRange: ActionCreatorWithPayload<
    InViewOffset,
    'room/main/setRoomInfoFilesInViewRange'
  >
  export const reloadRoomFiles: ActionCreatorWithoutPayload<'room/reload-room-files'>
  export const setRoomInfoFilesTab: ActionCreatorWithPayload<
    ROOM_INFO_FILES_TAB_VALUE,
    'main/setRoomInfoFilesTab'
  >

  export const getRoomItemById: (roomId: string) => () => {
    unread: boolean
    title: string
    roomType: string
    experimental: boolean
    isCompatible: boolean
    version: number
  }
  export const searchAllRooms: (searchText: string) => any
  export const setRoomTypesFilter: (filter: unknown[]) => any
  export const clearRoomListItemUnread: (roomId: string) => any
  export const getRoomConfigWithMyCapabilities: (roomId: string) => (
    state: any,
  ) => {
    roomType: string
    title: string
    description: string
    avatar: { driveId: string; path: string; version: number } | null
    canCall: boolean
    canPost: boolean
    canWrite: boolean
    canIndex: boolean
    isCallEnabled: boolean
    experimental: boolean
    version: number
  }
  export const getRoomMemberCount: (roomId: string) => any
  export const getRoomPairError: (state: any) => string
  export const getRoomListSearchError: (state: any) => string
  export const setRoomListSearchError: (payload: string) => any
  export const setRoomPairError: (payload: string) => any
  export const getRoomListAllIds: (state: any) => any
  export const setRoomConfig: (payload: Object) => any
  export const roomListInViewIdsChangeEvt: any
  export const parseInvitation: (
    invitation: string,
    pearProtocol: string,
  ) => string | null
  export const searchRoomSubmit: (payload: any) => any
  export const setPairingRoom: ActionCreatorWithPayload<PairingRoom>
  export const clearPairingRoom: ActionCreatorWithPayload<ClearPairingRoom>
  export const currentRoomSet: ActionCreatorWithPayload<{ roomId: string }>
  export const switchRoomSubmit: ActionCreatorWithPayload<{
    roomId: string
    messageId?: string
  }>
  export const createRoomSubmit: ActionCreatorWithPayload<{
    title: string
    opts?: {
      description?: string
      roomType?: string
      canCall?: 'true' | 'false'
    }
  }>
  export const joinRoomSubmit: ActionCreatorWithPayload<{
    link: string
    isInit?: boolean
  }>
  export const roomPairCancel: ActionCreatorWithPayload<string>

  export const getRoomAllPairing: (state: any) => PairingRoom[]
  export const getRoomPairingItemBySeedId: (
    seedId: string,
  ) => (state: any) => PairingRoom
  export const getRoomPairingCount: (state: any) => number
  export const clearRoomInvitation: () => any
  export const getRoomInvitation: (state: any) => any
  export const createRoomInvitation: ActionCreatorWithPayload<{
    roomId: string
    messageId?: string
    isPublic?: boolean
    invitationPreview?: {
      preview?: any
      dimensions?: any
      title?: string
      description?: string
    }
    opts?: {
      canModerate: boolean
      canIndex: boolean
      expiration: string | number
      reusable: boolean
    }
  }>
  export const setRoomInvitation: (invitationLink: string) => any
  export const getRoomMainId: (state: any) => string
  export const getRoomIndexingStatus: (state: any) => string
  export const setRoomCurrentIndexingTipSeen: ActionCreatorWithoutPayload<'joint/setRoomCurrentIndexingTipSeen'>
  export const UNINDEXED_ROOM_TYPE: {
    NORMAL: 'NORMAL'
    LOW: 'LOW'
    MODERATE: 'MODERATE'
  }
  export const getRoomPairingState: (state: any) => {
    activeSeedId: string
    all: any[]
  }
  export const getRoomPairingIdActive: (state: any) => string
  export const getRoomLeavingId: (state: any) => string
  export const getRoomLeavingInProgress: (state: any) => boolean
  export const getRoomLeavingShouldConfirm: (state: any) => boolean
  export const leaveRoomCleanup: ActionCreatorWithoutPayload<'joint/leaveRoomCleanup'>
  export const leaveRoomConfirmForce: ActionCreatorWithoutPayload<'joint/leaveRoomConfirmForce'>
  export const leaveRoomRejectForce: ActionCreatorWithoutPayload<'joint/leaveRoomRejectForce'>
  export const leaveRoomSubmit: ActionCreatorWithoutPayload<'joint/leaveRoomSubmit'>
  export const leaveRoomAsk: ActionCreatorWithPayload<
    string,
    'joint/leaveRoomAsk'
  >
  export const leaveRoomSuccessEvent: ActionCreatorWithPayload<'joint/leaveRoomSuccessEvent'>
  export const toggleRoomNotifications: ActionCreatorWithPayload<
    {
      roomId: string
    },
    'joint/toggleRoomNotifications'
  >
  export const roomSlice: Slice
  export const getRoomLastPairing: (state: any) => { status: PAIRING_STATUS }
  export const canCurrentMemberManageRoles: (state: any) => boolean
  export const roomNewActivity: ActionCreatorWithPayload<string>
}

declare module '@holepunchto/keet-store/store/preferences' {
  import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
  export const PREFERENCES: { [key: string]: string }
  export const getPreferencesRoomNotifications: (
    state: any,
    roomId: string,
  ) => boolean
  export const getPreferencesNotificationsType: () => NOTIFICATIONS_TYPES
  export const getPreferencesLocale: () => string
  export enum NOTIFICATIONS_TYPES {
    ALL = 'all',
    MENTIONS = 'mentions',
    NONE = 'none',
  }
  export const preferencesDataEvt: ActionCreatorWithPayload<any>
}

declare module '@holepunchto/keet-store/store/lib' {
  export const apiSubscribeSaga: (saga: Function, callback: Function) => any
}

declare module '@holepunchto/keet-store/store/error' {
  import { ActionCreatorWithPreparedPayload } from '@reduxjs/toolkit'
  export const taskErrorNotification: ActionCreatorWithPreparedPayload<
    [title: string, message: string],
    {
      title: string
      message: string
    }
  >
  export const GENERIC_PAIRING_ERROR: string
  export const getErrors: () => any
  export const logError: (error: unknown) => any
  export const errorSlice: any
}
declare module '@holepunchto/keet-store/store/notification' {
  import { ActionCreatorWithPreparedPayload } from '@reduxjs/toolkit'
  interface Notification {
    title?: string
    message: string
  }
  export const userSuccessNotification: ActionCreatorWithPreparedPayload<
    [Notification],
    Notification
  >
  export const userErrorNotification: ActionCreatorWithPreparedPayload<
    [Notification],
    Notification
  >
  export const addNotification: ActionCreatorWithPreparedPayload<
    [Notification],
    Notification
  >
  export const getNotifications: () => any
}

declare module '@holepunchto/keet-store/store/call/call.action' {
  export type PSwarmId = {
    swarmId: string
  }
  export type PRoomId = {
    roomId: string
  }
  export type PSwarmIdRoomId = PSwarmId & PRoomId
}
declare module '@holepunchto/keet-store/store/call' {
  import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
  import { PSwarmIdRoomId } from '@holepunchto/keet-store/store/call/call.action'

  type CallState = {
    memberId: string
    presenceMemberIds: Array<string>
    presenceByMemberId: any
    presenceMemberSwarmIds: Array<string>
    presenceBySwarmId: Record<string, { memberId: string }>
  }

  type RemoteMedia = {
    isAudioMuted: boolean
    isVideoMuted: boolean
    streamByName?: { camera?: { id?: string } }
  }

  export const CALL_STATUS: { [key: string]: string }
  export const CALL_SETTINGS_INITIAL_STATE: any
  export const INITIAL_STATE: any
  export const CALL_STATE_KEY: 'call'
  export const getCallStatus: () => ''
  export const getCallSettingsState: (state: any) => {
    isAudioMuted: boolean
    isVideoMuted: boolean
  }
  export const getMyAudioMuted: () => boolean
  export const getMyVideoMuted: () => boolean
  export const callLeave: () => any
  export const callAudioStreamToggle: () => any
  export const callVideoStreamToggle: () => any
  export const increaseCallPeersCount: ActionCreatorWithPayload<
    PSwarmIdRoomId,
    'call/increase-call-peers-count'
  >
  export const decreaseCallPeersCount: ActionCreatorWithPayload<
    PSwarmIdRoomId,
    'call/decrease-call-peers-count'
  >
  export const getCallState: (state: any) => CallState
  export const getCallRemoteMediaById: (
    id: string,
  ) => (state: any) => RemoteMedia
  export const openCallSettings: () => any
  export const callJoinCmd: () => any
  export const getCallIsOngoing: () => any
  export const getCallSettingsReady: () => any
  export const memberHasMedia: (
    memberId: string,
    presenceByMemberId: string,
  ) => boolean
  export const getMyCameraStreamId: () => any
  export const callVideoQualityUpdate: (quality: number) => any
  export const callVideoDeviceUpdate: (staticId: string) => any
  export const getCallUnknownPresenceIds: () => Array<string>
  export const getCallKnownMemberCount: (state: any) => number
  export const isCallJoinedMode: (status: string) => any
  export const getScreenStreams: (
    state: any,
  ) => { streamId: string; memberId: string }[]
  export const getCallPeerVideoCount: (state: any) => number
  export const getMyVideoQuality: (state: any) => number
  export const CALL_VIDEO_LIMIT_MEMBERS_GTE: number
  export const setMyAudioMuted: (arg: boolean) => any
  export const setMyVideoMuted: (arg: boolean) => any
  export const getMyVideoAllowed: (state: any) => boolean
  export const getCallAutoEndCountdown: (state: any) => number
  export const getCallShowAutoEndPopup: (state: any) => boolean
  export const resetCallAutoEndTimer: ActionCreatorWithoutPayload<'call/reset-call-auto-end-timer'>
}

declare module '@holepunchto/keet-store/store/media' {
  export type UpdateDevicesPayload = {
    addedDevices: Device[]
    removedDevices: Device[]
  }
  export type DeviceMap = {
    [x: string]: Device
  }
  export type AudioState = {
    devices: Device[]
    activeDev: Device
    permission: string
  }
  export type AudioOutputState = {
    devices: Device[]
    activeDev: Device
  }
  export type VideoState = {
    devices: Device[]
    activeDev: Device
    permission: string
  }
  export type DeviceState = {
    devicesMap: DeviceMap
    isReady: boolean
    audio: AudioState
    audioOutput: AudioOutputState
    video: VideoState
  }
  export type Device = {
    deviceStaticId: string
    deviceId: string
    default: boolean
    kind: string
    label: string
  }
  export const getDeviceState: () => DeviceState

  export function getAudioDevice(state: any): Device
  export function getAudioDevices(state: any): Device[]
  export function getAudioOutputDevice(state: any): Device
  export function getAudioOutputDevices(state: any): Device[]
  export function getVideoDevice(state: any): Device
  export function getVideoDevices(state: any): Device[]
  export const DEVICE_STATE_KEY: 'device'
}

declare module '@holepunchto/keet-store/store/chat/chat.state' {
  export type ChatMessageReactionItem = {
    count: number
    text: string
  }
}
declare module '@holepunchto/keet-store/store/chat/chat-reaction.model' {
  import { ChatMessageReactionItem } from '@holepunchto/keet-store/store/chat/chat.state'

  export type ReportedData = {
    reported: boolean
    reportedByMe: boolean
  }

  export function filterReportedFromReactions(payload: any): any
  export const getReportedFromReactions: (
    reactions: ChatMessageReactionItem[],
    mine: string[],
  ) => ReportedData
}
declare module '@holepunchto/keet-store/store/chat' {
  import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
  import {
    ChatEventType,
    ChatLastMessageType,
    InViewOffset,
    InViewIdsOffset,
  } from 'lib/types'

  export const CHAT_MESSAGE_FORMAT: {
    DISPLAY: string
    MARKDOWN: string
  }
  export const chatReducer: any
  export const CHAT_STATE_KEY: 'chat'
  export const MENTION_URL_PREFIX: string
  export const INITIAL_STATE: any
  export const reportChatMessage: (param: {
    memberId: string
    messageId: string
  }) => any
  export const isMentionUrlDeprecated: (url: string) => boolean
  export const isLoadingMessage: (event: ChatEventType) => boolean
  export const setChatMessagesInView: (
    inView: InViewOffset | InViewIdsOffset,
  ) => any
  export const getChatLastMessage: (
    state: any,
    roomId: string,
  ) => ChatLastMessageType
  export const updateChatLastMessage: ActionCreatorWithPayload<
    {
      roomId: string
    },
    'last-message/update-message'
  >
  export const updateMessage: (message: Object, params: Object) => any
  export const getEditingMessageId: (state: any) => any
  export const makeMentionUrl: (memberId: string) => string
  export const getChatMessageCount: (state: any) => number
  export const getChatMessageInitialLoading: (state: any) => boolean
  export const getChatGroupedMessages: (state: any) => ChatEventType[]
  export const getChatMoreMessagesFetching: (state: any) => boolean
  export const getChatMessageState: (state: any) => {
    groupedMessages: ChatEventType[]
  }
  export const makeGetPinnedChatMessageById: (
    messageId: string,
  ) => (state: any) => ChatEventType | undefined
  export const setChatMessageLastSeen: (seq: number) => any
  export const getChatMessageById: (
    state: any,
    messageId: string,
  ) => ChatEventType
  export const getChatReactionsById: (eventId: string) => any
  export const sendChatMessageSubmit: (params: Object) => any
  export const updateChatMessageSubmit: (params: Object) => any
  export const getChatMessageCoreIdById: (
    state: any,
    messageId: string,
  ) => ChatEventType['coreId']
  export const getChatMessageIds: (state: any) => string[]
  export const getChatMessageSeqLoaded: (state: any) => InViewOffset
  export const getChatMessagesInView: (state: any) => InViewOffset
  export const getChatMessageStartSeq: (state: any) => number
  export const setEditingMessage: (param: { messageId: string }) => any
  export const clearEditingMessage: () => any
  export const askReplyingMessageCmd: (param: { messageId: string }) => any
  export const getChatReplyToMessageById: (
    state: any,
    messageId: string,
  ) => ChatEventType | undefined
  export const getReplyingMessage: (state: any) => any
  export const clearReplyingMessage: () => any
  export const getChatMessageAllById: () => any
  export const chatResetToLastMessage: () => any
  export const getChatMessageUnreadCount: (state: any) => number
  export const getChatMessageInitialCache: (state: any) => boolean
  export const getChatLastSeenMessageSeq: (state: any) => number
  export const CHAT_MESSAGE_TYPE: {
    JOINED: 1
    CALL_STARTED: 2
    ROOM_AVATAR_CHANGED: 3
    INVITATION_CREATED: 4
    LEFT: 5
    ROOM_TITLE_CHANGED: 6
    MEMBER_REMOVED: 7
  }
  export const ANNOUNCEMENT_EVENT_TYPES: number[]
  export const toggleReactionCmd: (param: {
    coreId: {
      deviceId: string
      memberId: string
      seq: number
    }
    text: string
  }) => any
  export const getIsPinnedLimitMessageShown: (state: any) => boolean
  export const getLastPinnedChatMessage: (
    state: any,
  ) => ChatLastMessageType['message']
  export const getPinnedChatMessages: (state: any) => ChatEventType[]
  export const toggleMessagePinnedStatusCmd: ActionCreatorWithPayload<
    {
      messageId?: string
    },
    'chat/pin-message/toggle-message-status'
  >
  export const getPinnedChatMessagesCount: (state: any) => number
  export const PINNED_MESSAGES_LIMIT: number
  export const setIsPinnedLimitMessageShown: (value: boolean) => any
  export const getChatMessageIsAnchorId: (messageId: string) => any
  export const getChatMessageAnchorSeq: () => number
  export const getMessageIdIndexBySeq: ({
    seq,
    seqLoaded,
  }: {
    seq: number
    seqLoaded: InViewOffset
  }) => number
  export const chatMessageJumpToCmd: (param: { messageId: string }) => any
  export const setPinnedTabIsOpen: (isOpen: boolean) => any
}

declare module '@holepunchto/keet-store/store/chat/chat.js' {
  import { ReactionsType } from 'lib/types'
  export const getChatReactionsById: (id: string) => ReactionsType
}
declare module '@holepunchto/keet-store/store/chat/chat.model.js' {
  import { InViewOffset } from 'lib/types'

  export const noMessagesLoaded: (seqLoaded: InViewOffset) => boolean
  export const isSeqInView: (seqLoaded: InViewOffset, seq: number) => boolean
}

declare module '@holepunchto/keet-store/store/userProfile' {
  import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
  import { Profile } from 'lib/localStorage'

  export const setUserProfile: ActionCreatorWithPayload<Partial<Profile>>
  export const getUserProfile: (state: any) => Profile
  export const getUserProfileColor: (state: any) => string
  export const getNick: (pub: string) => string
  export const getTimePub: () => string
  export const getProfileSoftwareVersion: (state: any) => {
    dependencies?: { dhtVersion?: string }
  }
  export const PROFILE_SECTIONS: Record<string, string>
  export const setProfileCurrentSection: ActionCreatorWithPayload<
    typeof PROFILE_SECTIONS
  >
  export const getAvatarBase64: (url: string) => string
}

declare module '@holepunchto/keet-store/store/cache/cache.model' {
  export type CacheItem = {
    isCache: boolean
  }
}

declare module '@holepunchto/keet-store/store/member/member.model' {
  import { CacheItem } from '@holepunchto/keet-store/store/cache/cache.model'

  export type MemberData = {
    memberId: string
    deviceIds: string[]
    capabilities: number
    displayName: string
    name: string
    local: boolean
    avatar: string
    avatarUrl: string
    color: string
    anonymous: boolean
  }
  export type Member = MemberData & CacheItem
  export type MemberByRoomState = {
    bySwarmId: {
      [x: string]: Member
    }
    byMemberId: {
      [x: string]: Member
    }
    unknownSwarmIds: string[]
    notFoundMemberIds: string[]
    removedMemberIds: string[]
    myMemberId: string
    disabledCapabilities: boolean
  }
}

declare module '@holepunchto/keet-store/store/member' {
  import { Profile } from 'lib/localStorage'
  import { MemberType } from 'lib/types'
  import { MemberByRoomState } from '@holepunchto/keet-store/store/member/member.model'
  import { ActionCreatorWithPayload } from '@reduxjs/toolkit'
  export const AVATAR_BASE_PREFIX: string
  export const getAvatarUrl: (url: string) => string
  export const MemberCapabilities: {
    CAN_WRITE: string
    CAN_INDEX: string
    CAN_MODERATE: string
  }
  export const getCanMyMemberManageRoles: (roomId: string) => any
  export const getMemberBlockedById: (
    state: any,
    roomId?: string,
    memberId?: string,
  ) => boolean
  export const getMemberNotFoundIds: (
    roomId: string,
  ) => (state: any) => string[]
  export const parseMemberResponse: (item: any) => Profile
  export const calcProfileColor: (state: string) => any
  export const canModerate: (params: Object) => boolean
  export const canIndex: (params: Object) => any
  export const canWrite: (params: Object) => any
  export const getMyMemberId: (roomId: string) => any
  export const getMembersByRoomIdState: (
    roomId: string,
  ) => (state: unknown) => Readonly<MemberByRoomState>
  export const getMemberItemById: (
    roomId: string,
    memberId: string,
  ) => Selector<any, MemberType | undefined>
  export const getMyMember: (roomId: string) => any
  export const getMemberRole: (member: any) => number
  export const getMembersBlockedByRoomId: (
    roomId: string,
  ) => (state: any) => Record<string, boolean>
  export const memberUnblockSubmit: (memberId: string) => any
  export const memberSubscribeCmd: ActionCreatorWithPayload<{
    roomId: string
    memberId?: string
    memberIds?: string[]
  }>
  export const memberUnsubscribeCmd: ActionCreatorWithPayload<{
    roomId: string
    memberId?: string
    memberIds?: string[]
  }>
  export const MEMBER_ROLE: Record<string, number>
  export const MEMBER_STATE_KEY: 'member'
  export const createByRoomIdInitialData: () => any
  export const createMemberSubscriptionMiddleware: (debounceMs?: number) => any
  export const getMemberMutedById: (
    state: any,
    roomId: string,
    memberId: string,
  ) => any
  export const memberMuteToggleCmd: (params: {
    roomId: string
    memberId: string
    mute: boolean
  }) => any
  export const memberCheckMutedStatusCmd: (params: {
    roomId: string
    memberId: string
  }) => any
  export const getMemberMutedByIdLoading: (
    state: any,
    roomId: string,
    memberId: string,
  ) => any
  export const getMyMemberMuted: (state: any, roomId: string) => boolean
  export const canMuteMember: ({
    myRole,
    managedMemberRole,
  }: {
    myRole: number
    managedMemberRole: number
  }) => boolean
  export const getMemberById: (roomId: string) => any
}

declare module '@holepunchto/keet-store/store/member-list' {
  export const resetMemberList: () => any
  export const initializeMemberListSubscriptionCmd: (param: {
    limit: number
    subscribeToPeers: boolean
    subscribeToAdminsAndModerators: boolean
  }) => any
  export const initScrollLimits: (params: Object) => any
  export const getMemberListScrollIsTop: () => Boolean
  export const search: (text: string) => any
  export const setData: (payload: unknown[]) => any
  export const getMemberListSearch: (state: any) => string
  export const scroll: (direction: string) => any
  export const getMemberListModerators: (state: any) => unknown[]
  export const getMemberListPeers: (state: any) => unknown[]
  export const getMemberListIsLoading: (state: any) => boolean
  export const getMemberListIsError: (state: any) => boolean
  export const getMemberListIsFetching: (state: any) => boolean
  export const getMemberListScrollLimits: (state: any) => any
  export const getMembersData: (params: Object) => any
  export const getMemberListData: () => any
  export const searchMembers: (searchStr: string) => any
  export const reset: () => any
  export const onScrollEnd: () => any
  export const setItemsInView: (params: Object) => any
  export const getMemberItemById: (memberId: string) => any
}

declare module '@holepunchto/keet-store/api/rooms' {
  const roomsApi: {
    useSubscribeMemberQuery: (params1: Object, params2: Object) => any
    useSubscribeMemberCountQuery: (params1: Object, params2?: Object) => any
    useUpdateConfigMutation: () => any
    useSubscribeConfigQuery: (_params1: Object, params2?: Object) => any
    useSubscribeMembersQuery: (params1: Object, params2?: Object) => any
    useWaitUntilJoinedQuery: (params1: Object, params2?: Object) => any
    useSubscribeChatLengthQuery: (params1: Object, params2?: Object) => any
    useClearFileMutation: () => any
    useRemoveChatMessageMutation: () => any
    useClearAllFilesMutation: (otps: { removeRecords: boolean }) => any
    useGetFileEntryQuery: (params1: Object) => any
  }

  export default roomsApi
}

declare module '@holepunchto/keet-store/backend' {
  import { RoomFileRaw } from '@holepunchto/keet-store/store/room'

  interface Stream<T> {
    on(value: 'data', fn: (data: T) => void): void
    on(value: 'error', fn: (err: Error) => void): void
    destroy(value: null): void
  }

  interface Modules {
    [key: string]: string
  }

  export const getMobileBackend: () => {
    subscribeUnhandledErrors: () => any
  }
  export const getCoreBackend: () => {
    getRoomKeys(roomId: string): Promise<{ discoveryKey: string }>
    updateMember(
      roomId: string,
      name: string,
      avatar: string,
      opts: any,
    ): Promise<any>
    getSearchMembers(
      roomId: string,
      keyword: string,
      config: { limit: number },
    ): Promise<any>
    getLocalFiles(roomId: string): Promise<RoomFileRaw[]>
    getFileEntry(
      roomId: string,
      driveId: string,
      path: string,
      version: number,
    ): Promise<{
      httpLink: string
      key: string
      seq: number
      value: {
        blob: {
          blockLength: number
          blockOffset: number
          byteLength: number
          byteOffset: number
        }
        executable: boolean
      }
    }>
    getFileCleared(
      driveId: string,
      path: string,
      version: number,
    ): Promise<boolean>
    subscribeFileCleared(
      driveId: string,
      path: string,
      version: number,
    ): Stream<{ cleared: boolean }>
    getConfig(roomId: string): Promise<{
      title: string
      description: string
      roomType: string
      canCall: string
    }>
    waitUntilJoined(roomId: string): Promise<{
      capabilities: number
      local: boolean
      memberId: string
      pending: boolean
      swarmId: string
    }>
    upgradeRoom(roomId: string): Promise<any>
    getVersion(): Promise<{
      version: number
      modules: Modules
    }>
    subscribeRoomVersion(roomId: string): Promise<any>
    updateConfig: (param: {
      roomId: string
      key: string
      value: string
    }) => Promise<any>
  }
  export const setBackend: (param: { backendApi: any; callApi: any }) => any
}

declare module '@holepunchto/keet-store/store/network' {
  import { Action, Slice } from '@reduxjs/toolkit'

  export const networkSlice: Slice
  export const setNetworkData: (params: any) => Action
  export const getNetworkStatus: (state: any) => string
  export const getNetworkIp: (state: any) => string
  export const getNetworkPeerCount: (state: any) => number
  export const getNetworkPort: (state: any) => number
  export const getNetworkOnline: (state: any) => boolean
  export const NETWORK_STATUS: Record<string, string>
  export const networkSaga: (action: any) => void
}

declare module '@holepunchto/keet-store/store/constants' {
  export const LOCAL_CACHE_CONTEXT_KEY: string
  export const LOCAL_PREFERENCES_CONTEXT_KEY: string
}

declare module '@holepunchto/keet-store/store/member/member.reducer' {
  import { Slice } from '@reduxjs/toolkit'
  export const memberSlice: Slice
}

declare module '@holepunchto/keet-store/store/identity' {
  import { SeedWord } from 'component/RecoveryPhrase/RecoveryPhrase.Verification'
  import { UnknownAction, Slice } from '@reduxjs/toolkit'

  export const getIsIdentityComplete: (state: any) => any
  export const getIsIdentityAnonymous: (state: any) => boolean
  export const getIdentityStatus: (state: any) => string
  export const getIdentityDevices: (state: any) => any
  export const createIdentityInvitationLink: () => any
  export const getIdentityInvitationLink: (state: any) => string
  export const cancelIdentityInvitationLink: () => any
  export const submitSyncIdentity: (qrValue: string) => any
  export const setSyncDeviceErrorMsg: (payload: string) => any
  export const getSyncDeviceErrorMsg: (state: any) => string
  export const approveIdentityInvitedDevice: (id: string) => any
  export const getIdentityInvitedDevices: (state: any) => Array<any>
  export const rejectIdentityInvitedDevice: (id: string) => any
  export const resetBackupCreate: () => any
  export const setSyncDeviceAgreement: (value: boolean) => any
  export const getSyncDeviceRequest: (state: any) => any
  export const getSyncDeviceSeedId: (state: any) => string
  export const getSyncDeviceWaitingApprove: (state: any) => boolean
  export const cancelSyncDevice: (seedId: string) => any
  export const confirmSyncDevice: () => any
  export const initSyncDevice: () => any
  export const getSyncDeviceSuccess: () => boolean
  export const getSyncDeviceDeclined: () => boolean
  export const getSyncDeviceAgreement: () => string
  export const getAccountRecoverySuccess: () => boolean
  export const resetAccountRecovery: () => any
  export const getAccountRecoveryErrorMsg: (state: any) => string
  export const getAccountRecoveryLoading: (state: any) => boolean
  export const phraseToWords: (value: string) => Array<string>
  export const SECRET_PHRASE_WORDS_COUNT: number
  export const submitAccountRecovery: (value: string) => any
  export const identitySaga: (action: any) => void
  export const loadIdentitySync: (state: any) => any
  export const setSyncDeviceSeedId: (value: boolean) => any
  export const setSyncDeviceSyncRequest: (value: boolean) => any
  export const getBackupCreateSecretWords: (state: any) => Array<SeedWord>
  export const wordsToPhrase: (value: Array<SeedWord>) => string
  export const identitySlice: Slice
  export const getIdentityProfile: (state: any) => { memberId: string }
  export const askBackupCreateSecretWords: () => any
  export const getBackupCreateCheckWords: (state: any) => Array<SeedWord>
  export const getBackupCreateLoading: (state: any) => boolean
  export const getBackupCreateSuccess: (state: any) => boolean
  export const resetBackupCreateCheckWords: () => any
  export const submitBackupCreate: () => any
  export const isControlWordIndex: (state: any) => boolean
  export const IDENTITY_DEVICE_TYPES: {
    DESKTOP: string
    MOBILE: string
  }
  export const updateIdentityDeviceRequest: (param: {
    name: string
    deviceId: string
  }) => any
  export const getIdentitySecretPhrase: () => string
  export const fetchSecretPhraseCmd: () => UnknownAction
  export const createAndSubmitBackup: () => UnknownAction
  export const setSyncDeviceDeclined: (value: boolean) => UnknownAction
}

declare module '@holepunchto/keet-core-api' {
  export const ERRORS: {
    INVITE_EXPIRED: string
    INVALID_INVITATION_TYPE: string
    GENERIC_PAIRING_ERROR: string
  }
  export const isFeatureSupported: (abi: number, feature: FEATURES) => boolean

  export enum DM_STATUSES {
    ACCEPTED,
    REJECTED,
  }

  export enum FEATURES {
    DMS,
    LEAVE_ROOM,
    V2_CONFIG,
    PINNED_MESSAGES,
    ROOM_RENAME_EVENT,
    REPLY_TO,
    PERMISSION_DOWNGRADE,
    REMOVE_MEMBER,
    MUTE_MEMBER,
  }
  export enum DISPLAY_TYPES {
    MENTION,
    HTTP_LINK,
    PEAR_LINK,
    BOLD,
    ITALIC,
    CODE,
    EMOJI,
    CODE_BLOCK,
    STRIKE_THROUGH,
  }
}

declare module '@holepunchto/keet-store/api/debug' {
  export const useGetStatsQuery: () => any
}

declare module '@holepunchto/keet-store/store/lib/external-src' {
  export const apiTakeMatch: (param0: any, param: any) => any
}

declare module '@holepunchto/keet-store/store/room/dm' {
  export const ROOM_DM_MESSAGE_MAX_LENGTH: number
  export const getDmMemberByRoomId: (roomId: string) => (state: any) => string
}
declare module '@holepunchto/keet-store/store/media/media-constraints' {
  export const VIDEO_QUALITY_LOW: 0
  export const VIDEO_QUALITY_STANDARD: 1
  export const VIDEO_QUALITY_HIGH: 2
  /**
   * @typedef {'denied'|'granted'|'not-determined'|'restricted'|'unknown'|'unsupported'} Permission
   */
  /** @type {Record<string, Permission>} */
  export const PERMISSIONS: Record<string, Permission>
  export function getCameraAudioConstraints({
    audioDevice,
    audioMuted,
  }: {
    audioDevice: any
    audioMuted: any
  }):
    | false
    | {
        deviceId: {
          exact: any
        }
        autoGainControl: boolean
        echoCancellation: boolean
        noiseSuppression: boolean
      }
  export function getCameraVideoConstraints({
    videoDevice,
    videoMuted,
    videoQuality,
  }: {
    videoDevice: any
    videoMuted: any
    videoQuality: any
  }): any
  export function getScreenConstraints({ sourceId }: { sourceId: any }): {
    audio: boolean
    video: {
      mandatory: {
        chromeMediaSource: string
        chromeMediaSourceId: any
        minWidth: number
        minHeight: number
      }
    }
  }
  export type Permission =
    | 'denied'
    | 'granted'
    | 'not-determined'
    | 'restricted'
    | 'unknown'
    | 'unsupported'
}
declare module '@holepunchto/keet-store/store/stats' {
  import { ActionCreatorWithoutPayload } from '@reduxjs/toolkit'

  type StatsNormalized = {
    Rooms: {
      Active: any
      Open: any
    }
    Cores: {
      Open: any
      OpLogs: any
      Appends: any
      Bytes: string
    }
    Swarm: {
      Conns: any
      Updates: any
    }
    Punches: {
      Const: any
      Rand: any
      Open: any
    }
    Queries: {
      Active: any
      Total: any
    }
    Uploads: {
      Blocks: any
      Bytes: string
    }
    Downloads: {
      Blocks: any
      Bytes: string
    }
  }
  type StatsRaw = {
    backgroundSwarmingRooms?: Array<string>
    roomSubscriptions?: Array<number>
    threads?: Array<{
      id: number
      cpuUsage: number
      bare: boolean
    }>
    ipc?: {
      recv: number
      sent: number
    }
    memory?: {
      heapTotal: number
      heapUsed: number
      external: number
    }
    maxRSS?: number
  }

  export const enableStats: ActionCreatorWithoutPayload<'stats/enableStats'>
  export const disableStats: ActionCreatorWithoutPayload<'stats/disableStats'>

  export function getStats(state: any): Partial<StatsNormalized>
  export function getStatsRaw(state: any): StatsRaw

  type RawStats = {
    backgroundSwarmingRooms?: Array<string>
    roomSubscriptions?: Array<number>
    threads?: Array<{
      id: number
      cpuUsage: number
      bare: boolean
    }>
    ipc?: {
      recv: number
      sent: number
    }
    memory?: {
      heapTotal: number
      heapUsed: number
      external: number
    }
    maxRSS?: number
  }
  export function getStatsRaw(state: any): any
}
declare module '@holepunchto/keet-store/store/media/file' {
  import { PayloadAction, Slice } from '@reduxjs/toolkit'

  export const fileSlice: Slice
  export const FILE_PREVIEW_NAME_PREFIX = 'TMB-TMB-TMB'
  export const FILE_PREVIEW_SIZE_LARGE: number

  export type FileEntryPreview = {
    small: string | null
    large: string | null
    audio: number[] | null
  }

  export type Dimensions = {
    height: number
    width: number
  }

  export type FileEntry = {
    id: string
    driveId: string
    version: number
    path: string
    httpLink: string
    type?: string | null
    byteLength: number
    duration?: number | null
    dimensions?: Dimensions | null
    previewPointer?: FilePointer | null
    previews: FileEntryPreview
    cleared: boolean
  }

  export const getFileEntry: (
    state: any,
    file: FilePointer,
  ) => FileEntry | undefined

  export const getFileEntryById: (
    state: any,
    fileId: string,
  ) => FileEntry | undefined

  interface UpdateFileClearedPayload {
    fileId: string
    cleared: boolean
    isFromApi?: boolean
  }

  export interface FilePointer {
    driveId: string
    path: string
    version: number
  }

  export const getFileId: (filePointer: FilePointer) => string

  export const updateFileEntryCleared: (
    file: UpdateFileClearedPayload,
  ) => PayloadAction<UpdateFileClearedPayload>

  export const updateFileEntry: (
    file: FilePointer & { id: string },
  ) => PayloadAction<void>

  export type LoadStats = {
    blocks: number
    peers: number
    speed: number
  }
  export type FileBlob = {
    blockLength: number
    blockOffset: number
    byteLength: number
    byteOffset: number
  }
  export type FileStats = {
    peers: number
    downloadStats: LoadStats
    uploadStats: LoadStats
    blob: FileBlob
  }
  export const getFileStats: (
    state: any,
    fileId: string,
  ) => FileStats | undefined
}
declare module '@holepunchto/keet-store/store/cache' {
  import { ActionCreatorWithoutPayload } from '@reduxjs/toolkit'

  export const purgeAllCacheCmd: ActionCreatorWithoutPayload<'cache/purge-all-cmd'>
}

declare module '@holepunchto/keet-store/store/chat/message' {
  export const getCoreId: (messageId: string) => any
}

declare module '@holepunchto/keet-store' {
  // autogenerated from -> @holepunchto/keet-store/types/index.d.ts
  export function createStore(
    reducer: any,
    middlewares: any,
    config: any,
  ): import('@reduxjs/toolkit').EnhancedStore<
    any,
    import('redux').UnknownAction,
    import('@reduxjs/toolkit').Tuple<
      [
        import('redux').StoreEnhancer<{
          dispatch:
            | import('redux-thunk').ThunkDispatch<
                any,
                undefined,
                import('redux').UnknownAction
              >
            | import('redux-thunk').ThunkDispatch<
                any,
                unknown,
                import('redux').UnknownAction
              >
        }>,
        ...any[],
      ]
    >
  >
}
declare module '@holepunchto/keet-store/store/mobile' {
  import { Middleware } from '@reduxjs/toolkit'

  export const APP_CONTEXT_KEY: string
  export const ENV_CONTEXT_KEY: string
  export const LOCAL_STORAGE_CONTEXT_KEY: string
  export const MEDIA_CONTEXT_KEY: string
  export const PLATFORM_CONTEXT_KEY: string
  export const getMiddleware: (addMiddlewares?: Middleware[]) => Middleware[]
  // autogenerated from -> @holepunchto/keet-store/types/index.d.ts
  export function getReducer(addReducers?: {}): import('redux').Reducer<
    {
      app: {
        appStatus: string
        updateRequired: boolean
        applicationKey: string
        linkData: string
        currentRoomId: string
        currentCallRoomId: string
        locale: string
        localeIsUpdating: boolean
        notificationsType: string
        notificationsAlerts: string[]
        updateReason: any
      }
      room: import('immer').WritableDraft<{
        roomById: {}
        notificationsById: {}
        main: {
          roomId: string
          tipSize: number
          isEditingTitle: boolean
          isNotSupported: boolean
          roomInfo: {
            currentSection: string
            currentSectionArgs: {}
            prevSection: any
            prevSectionArgs: {}
            filesCurrentTab: string
            filesMedia: any[]
            filesAudio: any[]
            filesDocs: any[]
            filesInViewRange: {
              top: number
              bottom: number
            }
            filesEntriesById: {}
            filesSearch: string
          }
        }
        joint: {
          invitationLink: string
          invitationPreviewByLink: {}
          pairing: {
            all: any[]
            activeSeedId: string
            lastPairingRoom: any
            pairError: string
          }
          leaving: {
            roomId: string
            inProgress: boolean
            shouldConfirm: boolean
          }
        }
        list: {
          allRoomIds: any[]
          actualRoomIds: any[]
          searchRoomIds: any[]
          roomTypesFilter: number[]
          searchText: string
          inView: {
            top: number
            bottom: number
          }
          isLoading: boolean
          isError: boolean
          isSearching: boolean
          searchError: string
          unreadRoomsCount: number
        }
        dm: {
          sent: {
            byRequestId: {}
            byReceiverId: {}
          }
          received: {
            requests: any[]
            byRequestId: {}
            bySenderId: {}
            activeRequestId: string
          }
          member: {
            byRoomId: {}
          }
          room: {
            byMemberId: {}
          }
          reply: {
            sending: boolean
            success: boolean
            errorMsg: string
            type: any
          }
          request: {
            sending: boolean
            success: boolean
            errorMsg: string
          }
          pairing: {
            bySeedId: {}
            byRequestId: {}
          }
        }
      }>
      chat: import('store/chat').ChatState
      call: any
      error: import('store/error').ErrorState
      file: import('immer').WritableDraft<import('store/media/file').MediaState>
      identity: {
        accountRecover: {
          agreement: boolean
          loading: boolean
          errorMsg: string
          success: boolean
        }
        backupCreate: {
          agreement: boolean
          loading: boolean
          errorMsg: string
          success: boolean
          secretPhrase: string
          secretWords: any[]
          checkWords: any[]
          quickSetup: boolean
        }
        syncDevice: {
          agreement: boolean
          errorMsg: string
          waitingApprove: boolean
          declined: boolean
          success: boolean
          seedId: string
          pendingRequests: any[]
          syncRequest: any
        }
        identity: {
          status: string
          avatar: string
          displayName: string
          local: {}
          memberId: string
          deviceLoading: boolean
          deviceLoadError: string
          invitationLink: string
          invitedDevices: any[]
          devices: import('store/identity').Device[]
          secretPhrase: string
          hasSecretPhraseStored: boolean
        }
        termsOfService: boolean
      }
      notification: {
        notifications: {}
        frequencyResetInterval: number
      }
      network: {
        host: string
        port: string
        online: boolean
        connections: string
      }
      device: {
        devicesMap: {}
        isReady: boolean
        audio: any[]
        video: any[]
        audioOutput: any[]
      }
      userProfile: {
        name: string
        avatarUrl: string
        color: string
        currentSection: {
          section: string
          params: any
        }
        sections: {
          wallet: {
            config: any
            balance: any
            transactions: any[]
            loading: boolean
            error: string
          }
          developers: {
            visible: boolean
          }
          updates: {
            visible: boolean
          }
          software: {
            appName: string
            appVersion: string
            platformVersion: string
            dependencies: any
          }
        }
      }
      member: import('immer').WritableDraft<import('store/member').MemberState>
      'member-list': {
        admins: any[]
        moderators: any[]
        peers: any[]
        lastPeer: any
        searchPeers: any[]
        memberById: {}
        isAdminsModeratorsLoading: boolean
        isLoading: boolean
        isError: boolean
        isSearching: boolean
        searchText: string
        limit: any
        inView: {
          top: number
          bottom: number
        }
      }
      preferences:
        | Readonly<{
            data: {
              [x: string]: {}
            }
          }>
        | {
            data: any
          }
      __rtkQueryRooms: import('@reduxjs/toolkit/query').CombinedState<
        {
          createRoom: any
          createInvitation: any
          pairRoom: any
          leaveRoom: any
          subscribeActivateRoom: any
          getMemberCount: any
          waitUntilJoined: any
          getMembers: any
          subscribeRoomJoined: any
          subscribeMember: any
          subscribeMembers: any
          subscribeModerators: any
          subscribeMemberCount: any
          updateMember: any
          getMember: any
          getSearchMembers: any
          getPushNotificationMembers: any
          subscribeSearchMembers: any
          subscribePushNotificationMembers: any
          addChatMessage: any
          updateChatMessage: any
          removeChatMessage: any
          addEvent: any
          removeEvent: any
          getChatMessage: any
          getChatLength: any
          subscribeChatLength: any
          subscribeChatMessages: any
          addReaction: any
          removeReaction: any
          subscribeReactions: any
          updateConfig: any
          subscribeConfig: any
          getRoomMetadata: any
          getFileEntry: any
          clearFile: any
          clearAllFiles: any
          unclearFile: any
          subscribeFileCleared: any
          getFileCleared: any
          blockMember: any
          unblockMember: any
          subscribeBlockedMembers: any
          bookmark: any
          unbookmark: any
          getBookmarks: any
          getRecentRooms: any
          subscribeBookmarks: any
          subscribeRecentRooms: any
        },
        never,
        '__rtkQueryRooms'
      >
      __rtkQueryDebug: import('@reduxjs/toolkit/query').CombinedState<
        {
          getStats: any
        },
        never,
        '__rtkQueryDebug'
      >
      debug: {
        unlocked: boolean
      }
      stats: {
        stats: {}
        deviceStats: {
          memory: any
        }
        enabled: boolean
        pollInterval: number
        showToggle: boolean
        clicksToUnlockToggle: number
      }
      pay: {
        isUninitialized: boolean
        isLoading: boolean
        isSuccess: boolean
        isError: boolean
        invoice: string
        result: any
        error: string
      }
      UI: {
        appActive: boolean
        menu: any
        layoutType: string
        view: string
        feedView: string
        roomAddView: any
        tour: string
        tourStepIndex: number
        editing: boolean
        roomListTab: string
        panels: {
          rooms: boolean
          chat: boolean
          profile: boolean
          roomInfo: boolean
        }
        controls: boolean
        modal: import('store/ui').UiModalState
      }
    },
    any,
    Partial<{
      app: {
        appStatus: string
        updateRequired: boolean
        applicationKey: string
        linkData: string
        currentRoomId: string
        currentCallRoomId: string
        locale: string
        localeIsUpdating: boolean
        notificationsType: string
        notificationsAlerts: string[]
        updateReason: any
      }
      room: import('immer').WritableDraft<{
        roomById: {}
        notificationsById: {}
        main: {
          roomId: string
          tipSize: number
          isEditingTitle: boolean
          isNotSupported: boolean
          roomInfo: {
            currentSection: string
            currentSectionArgs: {}
            prevSection: any
            prevSectionArgs: {}
            filesCurrentTab: string
            filesMedia: any[]
            filesAudio: any[]
            filesDocs: any[]
            filesInViewRange: {
              top: number
              bottom: number
            }
            filesEntriesById: {}
            filesSearch: string
          }
        }
        joint: {
          invitationLink: string
          invitationPreviewByLink: {}
          pairing: {
            all: any[]
            activeSeedId: string
            lastPairingRoom: any
            pairError: string
          }
          leaving: {
            roomId: string
            inProgress: boolean
            shouldConfirm: boolean
          }
        }
        list: {
          allRoomIds: any[]
          actualRoomIds: any[]
          searchRoomIds: any[]
          roomTypesFilter: number[]
          searchText: string
          inView: {
            top: number
            bottom: number
          }
          isLoading: boolean
          isError: boolean
          isSearching: boolean
          searchError: string
          unreadRoomsCount: number
        }
        dm: {
          sent: {
            byRequestId: {}
            byReceiverId: {}
          }
          received: {
            requests: any[]
            byRequestId: {}
            bySenderId: {}
            activeRequestId: string
          }
          member: {
            byRoomId: {}
          }
          room: {
            byMemberId: {}
          }
          reply: {
            sending: boolean
            success: boolean
            errorMsg: string
            type: any
          }
          request: {
            sending: boolean
            success: boolean
            errorMsg: string
          }
          pairing: {
            bySeedId: {}
            byRequestId: {}
          }
        }
      }>
      chat: import('store/chat').ChatState
      call: {
        callId: string
        memberId: string
        swarmId: string
        settings: {
          devices: {
            audio: any
            audioOutput: any
            video: any
          }
          sharedScreen: string
          isAudioMuted: boolean
          isVideoMuted: boolean
          videoLimits: {
            meAllowed: boolean
            allowed: boolean
            showInfo: boolean
            maxQuality: number
          }
          videoTrackId: string
          videoQuality: number
          cameraStreamId: string
          screenStreamId: string
          isReady: boolean
        }
        presencesSortedByActivity: any[]
        presenceMemberIds: any[]
        presenceMemberSwarmIds: any[]
        presenceBySwarmId: {}
        unknownMemberPresence: {}
        mediaBySwarmId: {}
        mediaPermissions: {
          mic: string
          camera: string
          screen: string
        }
        peersCounter: {}
        showConfirmLeave: boolean
        showAutoEndPopup: boolean
        autoEndCountdown: number
        shareScreenDialogOpened: boolean
        shareScreenPermissionsOpened: boolean
        status: import('store/call').CallStatus
      }
      error: import('store/error').ErrorState
      file: import('immer').WritableDraft<import('store/media/file').MediaState>
      identity: {
        accountRecover: {
          agreement: boolean
          loading: boolean
          errorMsg: string
          success: boolean
        }
        backupCreate: {
          agreement: boolean
          loading: boolean
          errorMsg: string
          success: boolean
          secretPhrase: string
          secretWords: any[]
          checkWords: any[]
          quickSetup: boolean
        }
        syncDevice: {
          agreement: boolean
          errorMsg: string
          waitingApprove: boolean
          declined: boolean
          success: boolean
          seedId: string
          pendingRequests: any[]
          syncRequest: any
        }
        identity: {
          status: string
          avatar: string
          displayName: string
          local: {}
          memberId: string
          deviceLoading: boolean
          deviceLoadError: string
          invitationLink: string
          invitedDevices: any[]
          devices: import('store/identity').Device[]
          secretPhrase: string
          hasSecretPhraseStored: boolean
        }
        termsOfService: boolean
      }
      notification: {
        notifications: {}
        frequencyResetInterval: number
      }
      network: {
        host: string
        port: string
        online: boolean
        connections: string
      }
      device: {
        devicesMap: {}
        isReady: boolean
        audio: any[]
        video: any[]
        audioOutput: any[]
      }
      userProfile: {
        name: string
        avatarUrl: string
        color: string
        currentSection: {
          section: string
          params: any
        }
        sections: {
          wallet: {
            config: any
            balance: any
            transactions: any[]
            loading: boolean
            error: string
          }
          developers: {
            visible: boolean
          }
          updates: {
            visible: boolean
          }
          software: {
            appName: string
            appVersion: string
            platformVersion: string
            dependencies: any
          }
        }
      }
      member: import('immer').WritableDraft<import('store/member').MemberState>
      'member-list': {
        admins: any[]
        moderators: any[]
        peers: any[]
        lastPeer: any
        searchPeers: any[]
        memberById: {}
        isAdminsModeratorsLoading: boolean
        isLoading: boolean
        isError: boolean
        isSearching: boolean
        searchText: string
        limit: any
        inView: {
          top: number
          bottom: number
        }
      }
      preferences: Readonly<{
        data: {
          [x: string]: {}
        }
      }>
      __rtkQueryRooms: import('@reduxjs/toolkit/query').CombinedState<
        {
          createRoom: any
          createInvitation: any
          pairRoom: any
          leaveRoom: any
          subscribeActivateRoom: any
          getMemberCount: any
          waitUntilJoined: any
          getMembers: any
          subscribeRoomJoined: any
          subscribeMember: any
          subscribeMembers: any
          subscribeModerators: any
          subscribeMemberCount: any
          updateMember: any
          getMember: any
          getSearchMembers: any
          getPushNotificationMembers: any
          subscribeSearchMembers: any
          subscribePushNotificationMembers: any
          addChatMessage: any
          updateChatMessage: any
          removeChatMessage: any
          addEvent: any
          removeEvent: any
          getChatMessage: any
          getChatLength: any
          subscribeChatLength: any
          subscribeChatMessages: any
          addReaction: any
          removeReaction: any
          subscribeReactions: any
          updateConfig: any
          subscribeConfig: any
          getRoomMetadata: any
          getFileEntry: any
          clearFile: any
          clearAllFiles: any
          unclearFile: any
          subscribeFileCleared: any
          getFileCleared: any
          blockMember: any
          unblockMember: any
          subscribeBlockedMembers: any
          bookmark: any
          unbookmark: any
          getBookmarks: any
          getRecentRooms: any
          subscribeBookmarks: any
          subscribeRecentRooms: any
        },
        never,
        '__rtkQueryRooms'
      >
      __rtkQueryDebug: import('@reduxjs/toolkit/query').CombinedState<
        {
          getStats: any
        },
        never,
        '__rtkQueryDebug'
      >
      debug: {
        unlocked: boolean
      }
      stats: {
        stats: {}
        deviceStats: {
          memory: any
        }
        enabled: boolean
        pollInterval: number
        showToggle: boolean
        clicksToUnlockToggle: number
      }
      pay: {
        isUninitialized: boolean
        isLoading: boolean
        isSuccess: boolean
        isError: boolean
        invoice: string
        result: any
        error: string
      }
      UI: {
        appActive: boolean
        menu: any
        layoutType: string
        view: string
        feedView: string
        roomAddView: any
        tour: string
        tourStepIndex: number
        editing: boolean
        roomListTab: string
        panels: {
          rooms: boolean
          chat: boolean
          profile: boolean
          roomInfo: boolean
        }
        controls: boolean
        modal: import('store/ui').UiModalState
      }
    }>
  >
}
