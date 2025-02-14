import { createSelector, createSlice } from '@reduxjs/toolkit'

import { setAppCurrentRoomId } from '@holepunchto/keet-store/store/app'
import {
  getChatMessageAllById,
  getChatMessageIds,
} from '@holepunchto/keet-store/store/chat'

import { ModalTypes } from 'component/AppModal'
import {
  getStorageStatsCollapsed,
  getStorageStatsEnabled,
} from 'lib/localStorage/storageStats'
import { ShareContent } from 'lib/shareContent'

interface ModalCreatePayload {
  modalType: keyof typeof ModalTypes
  config?: {
    statusBarTranslucent?: boolean
  }
}
interface ModalVisibleState {
  showModal: true
  queue: ModalCreatePayload[]
}
interface ModalInvisibleState {
  showModal: false
}
export type ModalState = ModalVisibleState | ModalInvisibleState

interface VoiceMessageState {
  currentSoundUri?: string
  uri?: string
  duration?: string
  audioSamples?: Array<number>
  paused?: boolean
  isLocked?: boolean
  isPaused?: boolean
  isStopped?: boolean
}
interface VoiceMessagePayload {
  payload: VoiceMessageState
}

interface InitialState {
  appState: string
  appActive: boolean
  appModal: ModalState
  appUpdate: {
    isUpdate: boolean
    reason: string
    url: string
  }
  appNavigator: {
    isMounted: boolean
    isInitialized: boolean
    isStoreReady: boolean
    screenAfterOnboarding: string
    showStats: boolean
    collapseStats: boolean
    statsExpanded: boolean
  }
  callState: {
    speakerOn: boolean
  }
  voiceMessageState: VoiceMessageState
  shareContent: ShareContent[] | null
  showWalkthroughTooltip: boolean
  walkthroughStep: number
  lobby: {
    updating: boolean
  }
  device: {
    isOnSilentMode: boolean
  }
  roomScreen: {
    sessionLastSeenSeq: number
    chatBarHeight: number
    joinCallAtInitial: boolean
    isLoadingLatestMsgSeq: number
    isHistoryMode: boolean
  }
}
const initialState: InitialState = {
  appState: '',
  appActive: true,
  appModal: {
    showModal: false,
  },
  appUpdate: {
    isUpdate: false,
    reason: '',
    url: '',
  },
  appNavigator: {
    isMounted: false,
    isInitialized: false,
    isStoreReady: false,
    screenAfterOnboarding: '',
    showStats: getStorageStatsEnabled() ?? false,
    collapseStats: getStorageStatsCollapsed() ?? true,
    statsExpanded: false,
  },
  callState: {
    speakerOn: false,
  },
  voiceMessageState: {
    currentSoundUri: '',
    uri: '',
    audioSamples: [],
    duration: '',
    isLocked: false,
    isStopped: false,
  },
  shareContent: null,
  showWalkthroughTooltip: false,
  walkthroughStep: 0,
  lobby: {
    updating: true,
  },
  device: {
    isOnSilentMode: false,
  },
  roomScreen: {
    sessionLastSeenSeq: -1,
    chatBarHeight: 0,
    joinCallAtInitial: false,
    isLoadingLatestMsgSeq: 0,
    isHistoryMode: true,
  },
}

export const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    setAppState: (state, action) => {
      state.appState = action.payload || ''
    },
    setAppActive: (state, { payload: active }) => {
      state.appActive = active
    },
    setAppUpdate: (state, action) => {
      state.appUpdate = action.payload
    },
    showAppModal: (state, { payload }: { payload: ModalCreatePayload }) => {
      state.appModal = {
        showModal: true,
        queue:
          'queue' in state.appModal
            ? [...state.appModal.queue, payload]
            : [payload],
      }
    },
    showWalkthroughTooltip: (state) => {
      state.showWalkthroughTooltip = true
      state.walkthroughStep = 1
    },
    closeWalkthroughTooltip: (state) => {
      state.showWalkthroughTooltip = false
    },
    setWalkthroughStep: (state, action) => {
      state.walkthroughStep = action?.payload
    },
    closeAppModal: (state) => {
      const queue = 'queue' in state.appModal ? state.appModal.queue : []

      if (queue.length > 1) {
        queue.shift()
      } else {
        state.appModal = {
          showModal: false,
        }
      }
    },
    setSpeakerOn: (state, action) => {
      state.callState.speakerOn = action?.payload
    },
    setSoundUri: (state, action) => {
      state.voiceMessageState.currentSoundUri = action?.payload
    },
    setVoiceMessageState: (state, action: VoiceMessagePayload) => {
      state.voiceMessageState = {
        ...state.voiceMessageState,
        ...action.payload,
      }
    },
    setAudioSamples: (state, action) => {
      state.voiceMessageState = {
        ...state.voiceMessageState,
        audioSamples: [
          ...(state.voiceMessageState.audioSamples as []),
          action?.payload,
        ],
      }
    },
    setShareContent: (state, action) => {
      state.shareContent = action?.payload
    },
    mountNavigator: (state) => {
      state.appNavigator.isMounted = true
    },
    initializeNavigator: (state) => {
      state.appNavigator.isInitialized = true
    },
    setScreenAfterOnboarding: (state, action) => {
      state.appNavigator.screenAfterOnboarding = action?.payload
    },
    setShowStats: (state, action) => {
      state.appNavigator.showStats = action?.payload
    },
    setCollapseStats: (state, action) => {
      state.appNavigator.collapseStats = action?.payload
    },
    setStatsExpanded: (state, action) => {
      state.appNavigator.statsExpanded = action?.payload
    },
    setStoreReady: (state) => {
      state.appNavigator.isStoreReady = true
    },
    setLobbyUpdating: (state, action) => {
      state.lobby.updating = action?.payload
    },
    setIsOnSilentMode: (state, action) => {
      state.device.isOnSilentMode = action?.payload
    },
    setSessionLastSeenSeq: (state, action) => {
      state.roomScreen.sessionLastSeenSeq = action?.payload
    },
    setChatBarHeight: (state, action) => {
      state.roomScreen.chatBarHeight = action?.payload
    },
    setJoinCallAtInitial: (state, action) => {
      state.roomScreen.joinCallAtInitial = action?.payload
    },
    setIsLoadingLatestMsgSeq: (state, action) => {
      state.roomScreen.isLoadingLatestMsgSeq = action?.payload
    },
    setIsHistoryMode: (state, action) => {
      state.roomScreen.isHistoryMode = action?.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setAppCurrentRoomId, (state, action) => {
      if (action?.payload?.roomId) return
      state.roomScreen = initialState.roomScreen
    })
  },
})
type ApplicationState = ReturnType<typeof applicationSlice.reducer>

// The state here is combined with the keet-store, which is implemented in JavaScript.
// Therefore, the state type is set to `any` to ensure compatibility and prevent type conflicts.
export const getAppState = (state: any) => state.application as ApplicationState
export const getUIAppActive = (state: any) => getAppState(state).appActive
export const getUIAppUpdate = (state: any) => getAppState(state).appUpdate
export const getIsAppBackgrounded = (state: any) =>
  getAppState(state).appState === 'background'
export const getIsAppForegrounded = (state: any) =>
  getAppState(state).appState === 'active'
export const getAppModalState = (state: any): ModalState =>
  getAppState(state).appModal
export const getAppModalVisible = (state: any) =>
  getAppModalState(state).showModal
export const getAppModalVisibleData = (
  state: any,
): ModalCreatePayload | undefined => {
  const modalState = getAppModalState(state)
  if ('queue' in modalState && modalState.queue.length > 0) {
    return modalState.queue[0]
  }
}
export const getIsSpeakerOn = (state: any) =>
  getAppState(state).callState.speakerOn
export const getCurrentSoundUri = (state: any) =>
  getAppState(state).voiceMessageState.currentSoundUri
export const getVMUri = (state: any) => getAppState(state).voiceMessageState.uri
export const getVMAudioSamples = (state: any) =>
  getAppState(state).voiceMessageState.audioSamples
export const getVMIsStopped = (state: any) =>
  getAppState(state).voiceMessageState.isStopped
export const getVMDuration = (state: any) =>
  getAppState(state).voiceMessageState.duration
export const getVMIsLocked = (state: any) =>
  getAppState(state).voiceMessageState.isLocked
export const getVMShowAudioPlayer = (state: any) =>
  getVMIsStopped(state) && !!getVMUri(state) && !!getVMDuration(state)
export const getShareContent = (state: any): ShareContent[] =>
  getAppState(state).shareContent || []
export const getAppNavigatorIsMounted = (state: any): boolean =>
  getAppState(state).appNavigator.isMounted
export const getAppNavigatorIsInitialized = (state: any): boolean =>
  getAppState(state).appNavigator.isInitialized
export const getAppNavigatorIsReady = (state: any): boolean =>
  getAppNavigatorIsInitialized(state) && getAppNavigatorIsMounted(state)
export const getIsStoreReady = (state: any): boolean =>
  getAppState(state).appNavigator.isStoreReady
export const getShowStats = (state: any): boolean =>
  getAppState(state).appNavigator.showStats
export const getCollapseStats = (state: any): boolean =>
  getAppState(state).appNavigator.collapseStats
export const getIsStatsExpanded = (state: any): boolean =>
  getAppState(state).appNavigator.statsExpanded
export const getScreenAfterOnboarding = (state: any): string =>
  getAppState(state).appNavigator.screenAfterOnboarding

export const getWalkthroughTooltip = (state: any): boolean =>
  getAppState(state).showWalkthroughTooltip
export const getWalkthroughStep = (state: any) =>
  getAppState(state).walkthroughStep

export const getLobbyUpdating = (state: any) =>
  getAppState(state).lobby.updating

export const getIsOnSilentMode = (state: any) =>
  getAppState(state).device.isOnSilentMode
export const getSessionLastSeenSeq = (state: any) =>
  getAppState(state).roomScreen.sessionLastSeenSeq
export const getChatBarHeight = (state: any) =>
  getAppState(state).roomScreen.chatBarHeight
export const getJoinCallAtInitial = (state: any) =>
  getAppState(state).roomScreen.joinCallAtInitial
export const getIsLoadingLatestMsgSeq = (state: any) =>
  getAppState(state).roomScreen.isLoadingLatestMsgSeq
export const getIsHistoryMode = (state: any) =>
  getAppState(state).roomScreen.isHistoryMode

export const getMessages = createSelector(
  [getChatMessageIds, getChatMessageAllById],
  (ids, byId) => {
    const list = ids.map((id, index) => {
      const data = byId[id] || null
      if (index === 0 || index === ids.length - 1) data.isTail = true
      return data
    })

    return list.filter((item) => {
      if (item.isTail)
        return true // Mandatory to render tail in order to dispatch inView
      else if (item.parentId || item?.hidden)
        return false // We filter out chat that doesnt need to render
      else return true
    })
  },
)

export const {
  setAppState,
  setAppActive,
  setAppUpdate,
  showAppModal,
  closeAppModal,
  showWalkthroughTooltip,
  closeWalkthroughTooltip,
  setWalkthroughStep,
  setSpeakerOn,
  setSoundUri,
  setVoiceMessageState,
  setAudioSamples,
  setShareContent,
  mountNavigator,
  initializeNavigator,
  setStoreReady,
  setScreenAfterOnboarding,
  setShowStats,
  setCollapseStats,
  setStatsExpanded,
  setLobbyUpdating,
  setIsOnSilentMode,
  setSessionLastSeenSeq,
  setChatBarHeight,
  setJoinCallAtInitial,
  setIsLoadingLatestMsgSeq,
  setIsHistoryMode,
} = applicationSlice.actions
