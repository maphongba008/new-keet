// @ts-ignore
import { Middleware } from '@reduxjs/toolkit'

import { createStore } from '@holepunchto/keet-store'
import {
  LOCAL_CACHE_CONTEXT_KEY,
  LOCAL_PREFERENCES_CONTEXT_KEY,
} from '@holepunchto/keet-store/store/constants'
import { createMemberSubscriptionMiddleware } from '@holepunchto/keet-store/store/member'
import {
  APP_CONTEXT_KEY,
  ENV_CONTEXT_KEY,
  getMiddleware,
  getReducer,
  LOCAL_STORAGE_CONTEXT_KEY,
  MEDIA_CONTEXT_KEY,
  PLATFORM_CONTEXT_KEY,
} from '@holepunchto/keet-store/store/mobile'

import { applicationSlice } from 'reducers/application'
import { mobileAppSaga } from 'sagas/rootSaga'

import {
  APPLICATION_KEY,
  CUSTOM_LINK_PROTOCOLS,
  PEAR_PROTOCOL,
} from 'lib/constants'
import { createImagePreview, createVideoPreview } from 'lib/fileManager'
import { getIsTimeStatsEnabled, localStorage } from 'lib/localStorage'
import {
  getCameraPermission,
  getMicrophonePermission,
  getScreenSharePermission,
  requestCameraPermission,
  requestMicrophonePermission,
} from 'lib/media'
import { requestScreenSharePermission } from 'lib/media/requestScreenSharePermission'
import { getLaunchUrl } from 'lib/push'
import { rtkQueryErrorNotifyMiddleware } from 'lib/rtk-query-middleware'
import { injectStore } from 'lib/store'
import * as uploads from 'lib/uploads'
import { versions } from 'lib/versions'
import {
  extractWaveformData,
  extractWaveformDataFromFile,
} from 'lib/WaveformExtractor'

import { getReactotronEnhancers } from '../ReactotronConfig'

const createPlatformContext = () => ({
  config: {
    args: [],
    customLinkProtocols: CUSTOM_LINK_PROTOCOLS,
    pearProtocol: PEAR_PROTOCOL,
    getInitialURL: async () => {
      const rnInitialUrl = await __keet_boot.getInitialURL()

      if (rnInitialUrl) {
        return rnInitialUrl
      }

      return getLaunchUrl() || null
    },
  },
  messages: () => {},
  applicationKey: APPLICATION_KEY,
  media: {
    status: {
      microphone: getMicrophonePermission,
      camera: getCameraPermission,
      screen: getScreenSharePermission,
    },
    access: {
      microphone: requestMicrophonePermission,
      camera: requestCameraPermission,
      screen: requestScreenSharePermission,
    },
  },
})

const createAppContext = () => ({
  uploads,
  fileManager: {
    createImagePreview,
    createVideoPreview,
    createAudioPreview: extractWaveformData,
    createAudioPreviewByFile: extractWaveformDataFromFile,
  },
  localeManager: {
    getI18n: () => {},
    setLocale: async () => {},
  },
  versions,
})

const createMediaContext = () => ({
  media: {
    isAudioStateLive: () => {},
    getStreamAudioDeviceId: () => {},
    getStreamVideoDeviceId: () => {},
    stopStream: () => {},
    getMediaStream: () => {},
    getScreenStream: () => {},
    setVideoQuality: () => {},
  },
  streamSrcObjById: new Map(),
  getOwnStream: () => {},
  addOwnStream: () => {},
  cleanupOwnStreams: () => {},
  removeOwnStream: () => {},
})

// keet-store js has full access of mobile's localstorage.
const createLocalStorageContext = () => ({
  // @ts-ignore
  getItem: (...args) => localStorage.getItem(...args),
  // @ts-ignore
  setItem: (...args) => localStorage.setItem(...args),
  // @ts-ignore
  removeItem: (...args) => localStorage.removeItem(...args),
})

export const createLocalCacheContext = () => {
  return {
    open: () => {
      // nothing
    },
    getItem: async (key: string) => {
      const result = localStorage.getItem(key)
      return result ? JSON.parse(result) : undefined
    },
    getAllKeys: async () => localStorage.getAllKeys(),
    setItem: (key: string, value: any) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    removeItem: (key: string) => {
      localStorage.removeItem(key)
    },
    flush: () => {
      // nothing
    },
  }
}

const sagaContext = {
  [APP_CONTEXT_KEY]: createAppContext(),
  [MEDIA_CONTEXT_KEY]: createMediaContext(),
  [PLATFORM_CONTEXT_KEY]: createPlatformContext(),
  [LOCAL_STORAGE_CONTEXT_KEY]: createLocalStorageContext(),
  [LOCAL_CACHE_CONTEXT_KEY]: createLocalCacheContext(),
  [LOCAL_PREFERENCES_CONTEXT_KEY]: createLocalCacheContext(),
  [ENV_CONTEXT_KEY]: {
    isMobile: true,
    isMac: true,
    timeStats: {
      enabled: getIsTimeStatsEnabled(),
      log: (args: any) => console.error(args),
      groupLogStart: (args: any) => console.error(args),
      groupLogEnd: (args: any) => args && console.error(args),
    },
  },
}

export const reducers = getReducer({
  [applicationSlice.name]: applicationSlice.reducer,
})

export const createKeetStore = (preloadedState: Object = {}) => {
  const middlewares: Middleware[] = [
    rtkQueryErrorNotifyMiddleware,
    createMemberSubscriptionMiddleware(5),
  ]
  const store = createStore(reducers, getMiddleware(middlewares), {
    appSaga: mobileAppSaga,
    context: sagaContext,
    preloadedState,
    enhancers: getReactotronEnhancers(),
    defaultMiddlewareOptions: {
      serializableCheck: false,
      immutableCheck: false,
    },
  })

  injectStore(store)
  return store
}
