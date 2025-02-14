import { screen, userEvent, waitFor } from '@testing-library/react-native'
import { UIManager } from 'react-native'
import { Audio } from 'expo-av'
import { Notifier } from 'react-native-notifier'

import {
  appSlice,
  setAppCurrentCallRoomId,
} from '@holepunchto/keet-store/store/app'
import {
  INITIAL_STATE as CALL_INITIAL_STATE,
  CALL_SETTINGS_INITIAL_STATE,
  CALL_STATE_KEY,
} from '@holepunchto/keet-store/store/call'
import {
  INITIAL_STATE as CHAT_INITIAL_STATE,
  CHAT_STATE_KEY,
} from '@holepunchto/keet-store/store/chat'
import { roomSlice } from '@holepunchto/keet-store/store/room'

import { CallButton } from 'component/CallButton'
import { RoomScreenRefProvider } from 'screen/RoomScreen/ContextProvider/RoomScreenRefProvider'
import { APPIUM_IDs } from 'lib/appium'
import { navigationRef } from 'lib/navigation'
import { renderWithProviders } from 'lib/testUtils'

import { getStrings } from 'i18n/strings'

import * as CallLib from '../../lib/call'
import * as Navigation from '../../lib/navigation'
import * as BottomSheet from '../AppBottomSheet/AppBottomSheet.Store'

jest.mock('expo-av', () => ({
  Audio: {
    getPermissionsAsync: () => jest.fn(),
    PermissionStatus: {
      GRANTED: 'granted',
    },
  },
}))

jest.mock('../../lib/haptics', () => ({
  doVibrateSuccess: jest.fn(),
}))

jest.mock('@react-navigation/native', () => {
  const navigationCore = jest.requireActual('@react-navigation/native')
  return {
    ...navigationCore,
    useIsFocused: () => true,
    isReady: () => true,
  }
})

describe('CallButton Tests', () => {
  const roomId = 'testRoomId'
  const preloadedStateWithCall = {
    [appSlice.name]: {
      ...appSlice.getInitialState(),
      currentCallRoomId: roomId,
      currentRoomId: roomId,
    },
    [CALL_STATE_KEY]: {
      ...CALL_INITIAL_STATE,
      presenceMemberIds: ['member1', 'member2'],
    },
    [roomSlice.name]: {
      ...roomSlice.getInitialState(),
      roomById: {
        [roomId]: {
          canCall: 'true',
        },
      },
    },
  }

  const preloadedStateWithJoinCall = {
    ...preloadedStateWithCall,
    [CALL_STATE_KEY]: {
      ...preloadedStateWithCall[CALL_STATE_KEY],
      status: 'SETTINGS',
      settings: {
        ...CALL_SETTINGS_INITIAL_STATE,
        isReady: true,
      },
    },
    [CHAT_STATE_KEY]: {
      ...CHAT_INITIAL_STATE,
      message: {
        ...CHAT_INITIAL_STATE.message,
        isInitialLoading: false,
      },
    },
  }

  it('Check if Call On-going animation is played', async () => {
    const initialState = {
      preloadedState: preloadedStateWithCall,
    }
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} />
      </RoomScreenRefProvider>
    )
    const { store } = renderWithProviders(element, initialState)
    jest.advanceTimersByTime(200)
    expect(UIManager.dispatchViewManagerCommand).toHaveBeenCalledWith(
      3,
      'play',
      ['', 'auto', 'auto', false],
    )
    await waitFor(() => {
      store.dispatch(setAppCurrentCallRoomId(''))
    })
    jest.advanceTimersByTime(200)
    expect(UIManager.dispatchViewManagerCommand).toHaveBeenLastCalledWith(
      3,
      'reset',
      [],
    )
  })

  it('Ensure call button is not displayed if call is joined and in same room', () => {
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} />
      </RoomScreenRefProvider>
    )
    const initialState = {
      preloadedState: {
        ...preloadedStateWithCall,
        [CALL_STATE_KEY]: {
          ...preloadedStateWithCall[CALL_STATE_KEY],
          status: 'JOINED',
        },
        [appSlice.name]: {
          ...preloadedStateWithCall[appSlice.name],
          currentRoomId: roomId,
        },
      },
    }
    renderWithProviders(element, initialState)
    expect(screen.toJSON()).toBe(null)
  })

  it('Check if render Text button is rendered when fromLobby prop is passed and navigated to room onPress', async () => {
    const navigationReadySpy = jest.spyOn(navigationRef, 'isReady')
    const navigationSpy = jest.spyOn(Navigation, 'navigate')
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} fromLobby />
      </RoomScreenRefProvider>
    )
    const initialState = { preloadedState: preloadedStateWithCall }
    navigationReadySpy.mockReturnValue(true)
    renderWithProviders(element, initialState)
    const button = await screen.findByTestId(APPIUM_IDs.lobby_btn_join_room)
    const user = userEvent.setup()
    expect(button).toBeOnTheScreen()
    await user.press(button)
    expect(navigationSpy).toHaveBeenCalledWith(
      Navigation.SCREEN_ROOM,
      expect.objectContaining({
        joinCall: true,
      }),
    )
  })

  it('Show warning if call is disable upon pressing call button', async () => {
    const strings = getStrings()
    const spy = jest.spyOn(Notifier, 'showNotification')
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} />
      </RoomScreenRefProvider>
    )
    const initialState = {
      preloadedState: {
        ...preloadedStateWithCall,
        [roomSlice.name]: {
          ...preloadedStateWithCall[roomSlice.name],
          roomById: {
            [roomId]: {
              canCall: 'false',
            },
          },
        },
      },
    }
    renderWithProviders(element, initialState)
    jest.advanceTimersByTime(200)
    const button = screen.getByTestId(APPIUM_IDs.room_call_join)
    const user = userEvent.setup()
    await user.press(button)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        description: strings.room.callDisabledNotification,
      }),
    )
  })

  it('Show on-going call alert if press button from another room', async () => {
    const strings = getStrings()
    const spy = jest.spyOn(CallLib, 'showCallOnGoingAlert')
    const currentRoomId = 'testRoomId2'
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={currentRoomId} />
      </RoomScreenRefProvider>
    )
    const initialState = {
      preloadedState: {
        ...preloadedStateWithCall,
        [CALL_STATE_KEY]: {
          ...preloadedStateWithCall[CALL_STATE_KEY],
          status: 'JOINED',
        },
        [appSlice.name]: {
          ...preloadedStateWithCall[appSlice.name],
          currentRoomId: currentRoomId,
        },
        [roomSlice.name]: {
          ...roomSlice.getInitialState(),
          roomById: {
            [currentRoomId]: {
              canCall: 'true',
            },
          },
        },
      },
    }
    renderWithProviders(element, initialState)
    jest.advanceTimersByTime(200)
    const button = screen.getByTestId(APPIUM_IDs.room_call_join)
    const user = userEvent.setup()
    await user.press(button)
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        alertDesc: strings.call.alertDesc,
      }),
    )
  })

  it('Show bottom sheet if no microphone permission', async () => {
    const strings = getStrings()
    const spy = jest.spyOn(BottomSheet, 'showBottomSheet')
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} />
      </RoomScreenRefProvider>
    )
    const initialState = {
      preloadedState: preloadedStateWithCall,
    }
    renderWithProviders(element, initialState)
    jest.advanceTimersByTime(200)
    const button = screen.getByTestId(APPIUM_IDs.room_call_join)
    const user = userEvent.setup()
    await user.press(button)
    // Bottom sheet test is in separate file, Just checking string equality here
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: strings.common.microphonePermissionRequired,
      }),
    )
  })

  it('Check if able to join call if has permissions', async () => {
    const spy = jest.spyOn(Audio, 'getPermissionsAsync')
    const navigationReadySpy = jest.spyOn(navigationRef, 'isReady')
    const navigationSpy = jest.spyOn(Navigation, 'navigate')
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} />
      </RoomScreenRefProvider>
    )
    const initialState = {
      preloadedState: preloadedStateWithJoinCall,
    }
    renderWithProviders(element, initialState)
    jest.advanceTimersByTime(200)
    const button = screen.getByTestId(APPIUM_IDs.room_call_join)
    const user = userEvent.setup()
    spy.mockResolvedValue({
      granted: true,
      status: Audio.PermissionStatus.GRANTED,
      expires: 1,
      canAskAgain: false,
    })
    navigationReadySpy.mockReturnValue(true)
    await user.press(button)
    expect(navigationSpy).toHaveBeenCalledWith(
      Navigation.SCREEN_ROOM_CALL,
      expect.objectContaining({
        roomId,
      }),
    )
  })

  it('Check if able to join call from lobby when joinCall prop is passed', async () => {
    const spy = jest.spyOn(Audio, 'getPermissionsAsync')
    const navigationReadySpy = jest.spyOn(navigationRef, 'isReady')
    const navigationSpy = jest.spyOn(Navigation, 'navigate')
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} joinCall />
      </RoomScreenRefProvider>
    )
    const initialState = {
      preloadedState: preloadedStateWithJoinCall,
    }
    renderWithProviders(element, initialState)
    navigationReadySpy.mockReturnValue(true)
    spy.mockResolvedValue({
      granted: true,
      status: Audio.PermissionStatus.GRANTED,
      expires: 1,
      canAskAgain: false,
    })
    await waitFor(() => {
      jest.advanceTimersByTime(500)
    })
    expect(navigationSpy).toHaveBeenCalledWith(
      Navigation.SCREEN_ROOM_CALL,
      expect.objectContaining({
        roomId,
      }),
    )
  })

  it('Check if call should be muted if more that 4 peers', async () => {
    const spy = jest.spyOn(Audio, 'getPermissionsAsync')
    const navigationReadySpy = jest.spyOn(navigationRef, 'isReady')
    const navigationSpy = jest.spyOn(Navigation, 'navigate')
    const element = (
      <RoomScreenRefProvider>
        <CallButton roomId={roomId} joinCall />
      </RoomScreenRefProvider>
    )
    const initialState = {
      preloadedState: {
        ...preloadedStateWithJoinCall,
        [CALL_STATE_KEY]: {
          ...preloadedStateWithJoinCall[CALL_STATE_KEY],
          presenceMemberIds: ['member1', 'member2'],
          unknownMemberPresence: {
            unknownMember1: 'unknown',
            unknownMember2: 'unknown',
            unknownMember3: 'unknown',
          },
        },
      },
    }
    renderWithProviders(element, initialState)
    navigationReadySpy.mockReturnValue(true)
    spy.mockResolvedValue({
      granted: true,
      status: Audio.PermissionStatus.GRANTED,
      expires: 1,
      canAskAgain: false,
    })
    await waitFor(() => {
      jest.advanceTimersByTime(500)
    })
    expect(navigationSpy).toHaveBeenCalledWith(
      Navigation.SCREEN_ROOM_CALL,
      expect.objectContaining({
        roomId,
        shouldToggleMicrophoneAtInit: false,
      }),
    )
  })
})
