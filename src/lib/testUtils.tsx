import React, { PropsWithChildren } from 'react'
import { render, renderHook } from '@testing-library/react-native'
import type { RenderOptions } from '@testing-library/react-native'
import { Provider } from 'react-redux'
import createSagaMiddleware from 'redux-saga'
import { configureStore } from '@reduxjs/toolkit'

import { setBackend } from '@holepunchto/keet-store/backend'
import {
  APP_CONTEXT_KEY,
  ENV_CONTEXT_KEY,
  PLATFORM_CONTEXT_KEY,
} from '@holepunchto/keet-store/store/mobile'

import { injectStore } from './store'
import { createKeetStore, reducers } from '../store'

const mockSubscribe = {
  on: jest.fn(),
  data: jest.fn(),
  destroy: jest.fn(),
}
const MOCK_APP_CONTEXT_KEY = APP_CONTEXT_KEY
const MOCK_PLATFORM_CONTEXT_KEY = PLATFORM_CONTEXT_KEY
const MOCK_ENV_CONTEXT_KEY = ENV_CONTEXT_KEY

const mockedBackendApi = {
  api: {
    core: {
      getVersion: jest.fn(),
      subscribeRoomVersion: jest.fn().mockReturnValue(mockSubscribe),
      upgradeRoom: jest.fn(),
      getIdentity: jest.fn().mockReturnValue({
        local: {
          deviceId: 'device-id',
        },
        devices: [],
      }),
      subscribeIdentity: jest.fn().mockReturnValue(mockSubscribe),
      generateIdentity: jest.fn(),
      restoreIdentity: jest.fn(),
      confirmIdentity: jest.fn(),
      confirmPairingRequest: jest.fn(),
      subscribeIdentityPairingRequests: jest
        .fn()
        .mockReturnValue(mockSubscribe),
      updateIdentityProfile: jest.fn(),
      updateIdentityDevice: jest.fn(),
      startPairingIdentity: jest.fn(),
      pairIdentity: jest.fn(),
      createRoom: jest.fn(),
      pairRoom: jest.fn(),
      leaveRoom: jest.fn(),
      startPairingRoom: jest.fn(),
      stopPairingRoom: jest.fn(),
      subscribePendingRooms: jest.fn().mockReturnValue(mockSubscribe),
      subscribeActivateRoom: jest.fn().mockReturnValue(mockSubscribe),
      getRoomKeys: jest.fn().mockReturnValue({
        discoveryKey: 'Testkey',
      }),
      getTipSize: jest.fn(),
      bookmark: jest.fn(),
      unbookmark: jest.fn(),
      subscribeBookmarks: jest.fn().mockReturnValue(mockSubscribe),
      getRecentRooms: jest.fn().mockResolvedValue([]),
      getLocalRoomMetadata: jest.fn(),
      subscribeRecentRooms: jest.fn().mockReturnValue(mockSubscribe),
      subscribeUnreadActivity: jest.fn().mockReturnValue(mockSubscribe),
      setRoomUnread: jest.fn(),
      bumpRoomPriority: jest.fn(),
      addDevice: jest.fn(),
      removeDevice: jest.fn(),
      getDevice: jest.fn(),
      getDevices: jest.fn(),
      subscribeDevice: jest.fn().mockReturnValue(mockSubscribe),
      subscribeDevices: jest.fn().mockReturnValue(mockSubscribe),
      createIdentityInvitation: jest.fn(),
      createInvitation: jest.fn(),
      updateMember: jest.fn(),
      getMember: jest.fn().mockReturnValue({}),
      getMembers: jest.fn(),
      getModerators: jest.fn(),
      getMemberCount: jest.fn(),
      waitUntilJoined: jest.fn().mockReturnValue({
        memberId: 'testMember',
      }),
      getMemberForDevice: jest.fn(),
      subscribeMemberCount: jest.fn().mockReturnValue(mockSubscribe),
      subscribeMember: jest.fn().mockReturnValue(mockSubscribe),
      subscribeMembers: jest.fn().mockReturnValue(mockSubscribe),
      subscribeModerators: jest.fn().mockReturnValue(mockSubscribe),
      subscribeMemberForDevice: jest.fn().mockReturnValue(mockSubscribe),
      getSearchMembers: jest.fn(),
      getPushNotificationMembers: jest.fn(),
      subscribeSearchMembers: jest.fn().mockReturnValue(mockSubscribe),
      subscribePushNotificationMembers: jest
        .fn()
        .mockReturnValue(mockSubscribe),
      blockMember: jest.fn(),
      unblockMember: jest.fn(),
      getBlockedMembers: jest.fn(),
      subscribeBlockedMembers: jest.fn(),
      getConnectedMembers: jest.fn(),
      subscribeConnectedMembers: jest.fn().mockReturnValue(mockSubscribe),
      updateConfig: jest.fn(),
      getConfig: jest.fn(),
      subscribeConfig: jest.fn().mockReturnValue(mockSubscribe),
      addChatMessage: jest.fn(),
      updateChatMessage: jest.fn(),
      removeChatMessage: jest.fn(),
      addCallStartedEvent: jest.fn(),
      addRoomAvatarChangedEvent: jest.fn(),
      addEvent: jest.fn(),
      removeEvent: jest.fn(),
      getChatMessage: jest.fn(),
      getChatMessages: jest.fn(),
      getChatLength: jest.fn(),
      subscribeChatMessages: jest.fn().mockReturnValue(mockSubscribe),
      subscribeChatLength: jest.fn().mockReturnValue(mockSubscribe),
      sendInvitations: jest.fn(),
      updatePrivateMailboxRecord: jest.fn(),
      getPrivateMailboxRecords: jest.fn(),
      subscribePrivateMailbox: jest.fn().mockReturnValue(mockSubscribe),
      addReaction: jest.fn(),
      removeReaction: jest.fn(),
      getReactions: jest.fn(),
      subscribeReactions: jest.fn().mockReturnValue(mockSubscribe),
      addFileBlob: jest.fn(),
      addFile: jest.fn(),
      saveFileBlob: jest.fn(),
      saveFile: jest.fn(),
      sendFile: jest.fn(),
      removeFile: jest.fn(),
      subscribeFileInfo: jest.fn().mockReturnValue(mockSubscribe),
      clearAllFiles: jest.fn(),
      getFileEntry: jest.fn(),
      getLocalFiles: jest.fn(),
      startDownload: jest.fn(),
      cancelDownload: jest.fn(),
      clearFile: jest.fn(),
      unclearFile: jest.fn(),
      getFileCleared: jest.fn(),
      subscribeFileCleared: jest.fn().mockReturnValue(mockSubscribe),
      getStats: jest.fn().mockResolvedValue([]),
    },
    preferences: {
      query: jest.fn().mockResolvedValue({}),
      update: jest.fn(),
      subscribe: jest.fn().mockReturnValue({
        on: jest.fn(),
        data: jest.fn(),
      }),
    },
    mobile: {
      subscribeUnhandledErrors: jest.fn().mockReturnValue({
        on: jest.fn(),
        data: jest.fn(),
      }),
      getSwarmId: jest.fn().mockResolvedValue('swarmId'),
    },
  },
}
const mockedCallApi = {
  authorize: jest.fn(),
  deauthorize: jest.fn(),
  joinPeer: jest.fn(),
  leavePeer: jest.fn(),
  requestTrack: jest.fn(),
  unrequestTrack: jest.fn(),
  signalMedia: jest.fn(),
  getRequestedTracks: jest.fn(),
  subscribeRequestedTracks: jest.fn().mockReturnValue(mockSubscribe),
  subscribeMediaSignals: jest.fn().mockReturnValue(mockSubscribe),
  subscribeProxyUpdates: jest.fn().mockReturnValue(mockSubscribe),
  shareTrack: jest.fn(),
  unshareTrack: jest.fn(),
  relayTrack: jest.fn(),
  unrelayTrack: jest.fn(),
  subscribeAvailableTracks: jest.fn().mockReturnValue(mockSubscribe),
  getAvailableTracks: jest.fn(),
  setPresent: jest.fn(),
  setNotPresent: jest.fn(),
  presence: {
    subscribePresence: jest.fn().mockReturnValue(mockSubscribe),
    getPresence: jest.fn(),
  },
  devices: {
    subscribeDevices: jest.fn().mockReturnValue(mockSubscribe),
  },
}

jest.mock('redux-saga/effects', () => {
  return {
    ...jest.requireActual('redux-saga/effects'),
    getContext: jest.fn().mockImplementation((key: any) => {
      const map = {
        [MOCK_ENV_CONTEXT_KEY]: { isTest: true, isMac: true, isMobile: true },
        [MOCK_APP_CONTEXT_KEY]: {
          localeManager: {
            setLocale: jest.fn(),
          },
        },
        [MOCK_PLATFORM_CONTEXT_KEY]: {
          config: {
            getInitialURL: jest.fn().mockResolvedValue(''),
          },
          media: {
            status: {
              microphone: jest.fn().mockResolvedValue('granted'),
              camera: jest.fn().mockResolvedValue('granted'),
              screen: jest.fn().mockResolvedValue('unsupported'),
            },
            access: {
              microphone: jest.fn().mockResolvedValue(true),
              camera: jest.fn().mockResolvedValue(true),
              screen: jest.fn().mockResolvedValue(false),
            },
          },
        },
      }
      return map[key]
    }),
  }
})

export const mockCoreApis = () =>
  setBackend({ backendApi: mockedBackendApi, callApi: mockedCallApi })

export const getMockStore = (preloadedState: Object = {}) => {
  mockCoreApis()
  const store = createKeetStore(preloadedState)
  return store
}

export const getMockStoreWithMiddleware = () => {
  const sagaMiddleware = createSagaMiddleware()
  const store = configureStore({
    reducer: reducers,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }).concat([sagaMiddleware]),
  })
  injectStore(store)
  return { store, sagaMiddleware }
}

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: any
  store?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    store = getMockStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return <Provider store={store}>{children}</Provider>
  }
  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

export function renderHookWithProviders(
  hook: () => unknown,
  {
    preloadedState = {},
    store = getMockStore(preloadedState),
    ...renderOptions
  }: ExtendedRenderOptions = {},
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return <Provider store={store}>{children}</Provider>
  }
  return { store, ...renderHook(hook, { wrapper: Wrapper, ...renderOptions }) }
}
