import React from 'react'
import {
  fireEvent,
  screen,
  userEvent,
  waitFor,
} from '@testing-library/react-native'

import { getTheme } from 'component/theme'
import { APPIUM_IDs } from 'lib/appium'
import { navigationRef, SCREEN_ROOM } from 'lib/navigation'
import { renderWithProviders } from 'lib/testUtils'

import { getStrings } from 'i18n/strings'

import * as Navigation from '../../lib/navigation'
import RoomActionSheet from '../AppBottomSheet/SheetComponents/RoomActionSheet/index'

const INVITE_LINK =
  'pear://dev/yrbtkmhjokhxjce78aehwzgf7cnfwc8eruxky41ytumhaedk8fareo5gsosgazk16ce7joe1wp68ub3j1asfgap8wgiy6boia99fx54xcdf4thug'
jest.mock('expo-clipboard', () => ({
  getStringAsync: jest.fn().mockReturnValue(INVITE_LINK),
}))

jest.mock('../../lib/media', () => ({
  pickBarcodeImage: jest.fn().mockImplementation(() => {
    return INVITE_LINK
  }),
}))

describe('Test to take care of RoomAction Button option list', () => {
  const strings = getStrings()
  const theme = getTheme()

  beforeEach(() => {
    jest.spyOn(React, 'useMemo').mockImplementation((f) => f())
  })

  it('RoomActionOnboarding initial rendering with testing UI elements \n Snapshot Testing', () => {
    const element = <RoomActionSheet />
    renderWithProviders(element)
    const onBoardElementText = screen.getByText(
      strings.lobby.roomActions.onboardText,
    )
    expect(onBoardElementText).toBeTruthy()

    const onBoardElementTitle = screen.getByText(
      strings.lobby.roomActions.onboardTitle,
    )
    expect(onBoardElementTitle).toBeTruthy()

    const joinRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_join_room)
    expect(joinRoomBtn).toHaveTextContent(strings.lobby.roomActions.joinRoomBtn)

    const createRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_create_room)
    expect(createRoomBtn).toHaveTextContent(
      strings.lobby.roomActions.createRoomBtn,
    )
    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('RoomActionOnboarding -> joinRoomAction sheet initial render', async () => {
    const element = <RoomActionSheet />
    renderWithProviders(element)
    const joinRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_join_room)
    expect(joinRoomBtn).toHaveTextContent(strings.lobby.roomActions.joinRoomBtn)

    await userEvent.press(joinRoomBtn)

    const joinActionSheetTitle = screen.getByText(
      strings.lobby.roomActions.joinAction.title,
    )
    expect(joinActionSheetTitle).toBeTruthy()

    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('RoomActionOnboarding -> joinRoomAction trigger back functionality', async () => {
    const element = <RoomActionSheet />
    renderWithProviders(element)
    const joinRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_join_room)
    expect(joinRoomBtn).toHaveTextContent(strings.lobby.roomActions.joinRoomBtn)

    await userEvent.press(joinRoomBtn)

    const joinActionSheetTitle = screen.getByText(
      strings.lobby.roomActions.joinAction.title,
    )
    expect(joinActionSheetTitle).toBeTruthy()

    const joinAction = screen.getByTestId(APPIUM_IDs.back_button)
    await userEvent.press(joinAction)

    const onBoardElementTitle = screen.getByText(
      strings.lobby.roomActions.onboardTitle,
    )
    expect(onBoardElementTitle).toBeTruthy()
  })

  it('RoomActionOnboarding -> joinRoomAction enter the link', async () => {
    const element = <RoomActionSheet />
    renderWithProviders(element)
    const joinRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_join_room)
    expect(joinRoomBtn).toHaveTextContent(strings.lobby.roomActions.joinRoomBtn)

    await userEvent.press(joinRoomBtn)

    const joinActionSheetTitle = screen.getByText(
      strings.lobby.roomActions.joinAction.title,
    )
    expect(joinActionSheetTitle).toBeTruthy()

    let joinRoomTextInput = screen.getByTestId(APPIUM_IDs.lobby_input_room_name)

    fireEvent(joinRoomTextInput, 'focus')
    expect(joinRoomTextInput).toHaveStyle({
      borderColor: theme.color.blue_400,
    })
    fireEvent.changeText(joinRoomTextInput, INVITE_LINK)
    expect(joinRoomTextInput.props.defaultValue).toBe(INVITE_LINK)

    fireEvent.changeText(joinRoomTextInput, '')

    const pasteButton = screen.getByTestId(APPIUM_IDs.lobby_btn_paste)
    await userEvent.press(pasteButton)
    expect(joinRoomTextInput.props.defaultValue).toBe(INVITE_LINK)

    // const qrScannerButton = screen.getByTestId(APPIUM_IDs.lobby_btn_qr)
    // await userEvent.press(qrScannerButton)
  })

  it('RoomActionOnboarding -> joinRoomAction trigger the QR sheet', async () => {
    const element = <RoomActionSheet />

    renderWithProviders(element)
    const joinRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_join_room)
    expect(joinRoomBtn).toHaveTextContent(strings.lobby.roomActions.joinRoomBtn)

    await userEvent.press(joinRoomBtn)

    const joinActionSheetTitle = screen.getByText(
      strings.lobby.roomActions.joinAction.title,
    )
    expect(joinActionSheetTitle).toBeTruthy()

    let joinRoomTextInput = screen.getByTestId(APPIUM_IDs.lobby_input_room_name)

    const pasteButton = screen.getByTestId(APPIUM_IDs.lobby_btn_paste)
    await userEvent.press(pasteButton)
    expect(joinRoomTextInput.props.defaultValue).toBe(INVITE_LINK)

    const chooseImage = screen.getByText('Choose image')
    expect(chooseImage).toBeTruthy()

    await userEvent.press(chooseImage)

    expect(joinRoomTextInput.props.defaultValue).toBe(INVITE_LINK)
  })

  it('RoomActionOnboarding -> createRoomAction initial render', async () => {
    const element = <RoomActionSheet />
    renderWithProviders(element)

    const createRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_create_room)
    expect(createRoomBtn).toHaveTextContent(
      strings.lobby.roomActions.createRoomBtn,
    )

    await userEvent.press(createRoomBtn)

    const createRoomText = screen.getByText(
      strings.lobby.roomActions.roomTypeAction.description,
    )
    expect(createRoomText).toBeTruthy()

    const createChatBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_create_chat)
    expect(createChatBtn).toBeTruthy()

    expect(screen.toJSON()).toMatchSnapshot()
  })

  it('RoomActionOnboarding -> createRoomAction -> crate chat room sheet initial render', async () => {
    const navigationSpy = jest.spyOn(Navigation, 'navigate')
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true)
    const element = <RoomActionSheet />
    renderWithProviders(element)
    const createRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_create_room)
    expect(createRoomBtn).toHaveTextContent(
      strings.lobby.roomActions.createRoomBtn,
    )

    await userEvent.press(createRoomBtn)

    const createRoomText = screen.getByText(
      strings.lobby.roomActions.roomTypeAction.description,
    )
    expect(createRoomText).toBeTruthy()

    const createChatBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_create_chat)
    expect(createChatBtn).toBeTruthy()
    await userEvent.press(createChatBtn)

    const createChatRoomTitle = screen.getByText(
      strings.lobby.roomActions.createAction.title,
    )
    expect(createChatRoomTitle).toBeTruthy()

    const chatRoomTitle = screen.getByText(
      strings.lobby.roomActions.createAction.roomNameLabel,
    )
    expect(chatRoomTitle).toBeTruthy()

    const submitBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_submit)
    await userEvent.press(submitBtn)

    const createChatRoomTitleInput = screen.getByTestId(
      APPIUM_IDs.lobby_input_room_name,
    )
    expect(createChatRoomTitleInput).toHaveStyle({
      borderColor: theme.color.danger,
    })

    const chatRoomDescription = screen.getByText(
      strings.lobby.roomActions.createAction.roomDescLabel,
    )
    expect(chatRoomDescription).toBeTruthy()

    const createChatRooDesInput = screen.getByTestId(
      APPIUM_IDs.lobby_input_room_description,
    )

    fireEvent.changeText(createChatRoomTitleInput, 'Room 1')
    fireEvent.changeText(createChatRooDesInput, 'Room Description')
    await userEvent.press(submitBtn)

    await waitFor(() => {
      expect(navigationSpy).toHaveBeenCalledWith(SCREEN_ROOM)
    })
  })

  it('RoomActionOnboarding -> createRoomAction -> create broadcast room sheet action', async () => {
    const navigationSpy = jest.spyOn(Navigation, 'navigate')
    jest.spyOn(navigationRef, 'isReady').mockReturnValue(true)
    const element = <RoomActionSheet />
    renderWithProviders(element)
    const createRoomBtn = screen.getByTestId(APPIUM_IDs.lobby_btn_create_room)
    expect(createRoomBtn).toHaveTextContent(
      strings.lobby.roomActions.createRoomBtn,
    )

    await userEvent.press(createRoomBtn)

    const createRoomText = screen.getByText(
      strings.lobby.roomActions.roomTypeAction.description,
    )
    expect(createRoomText).toBeTruthy()

    const createBroadcastFeedBtn = screen.getByTestId(
      APPIUM_IDs.lobby_btn_create_broadcast,
    )
    expect(createBroadcastFeedBtn).toBeTruthy()

    await userEvent.press(createBroadcastFeedBtn)

    expect(navigationSpy).toHaveBeenCalled()
  })
})
