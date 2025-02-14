import { call, put } from 'redux-saga/effects'

import {
  callVideoDeviceUpdate,
  callVideoQualityUpdate,
  callVideoStreamToggle,
} from '@holepunchto/keet-store/store/call'
import { Device } from '@holepunchto/keet-store/store/media'

import {
  FACE_CAM_DEVICE_STATIC_ID,
  handleCallEnded,
  handleCallOnGoing,
  onVideoCameraToggleSaga,
  videoToggleSaga,
} from 'sagas/callSaga'

import { showBottomSheet } from 'component/AppBottomSheet/AppBottomSheet.Store'
import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { removeLobbyCallData } from 'lib/localStorage'
import * as navigation from 'lib/navigation'
import { mockCoreApis } from 'lib/testUtils'

jest.mock('component/AppBottomSheet/AppBottomSheet.Store', () => ({
  ...jest.requireActual('component/AppBottomSheet/AppBottomSheet.Store'),
  showBottomSheet: jest.fn(),
}))

describe('callSaga tests', () => {
  mockCoreApis()

  it('Test handleCallOnGoing saga', () => {
    const callRoomId = 'testRoom1'
    const roomTitle = 'Test Room'
    const routeSpy = jest.spyOn(navigation, 'getCurrentRoute')
    const generator = handleCallOnGoing({ payload: { roomId: callRoomId } })
    routeSpy.mockReturnValue('home')
    generator.next()
    generator.next('testRoom' as jest.ArgsType<String>)
    generator.next({ title: roomTitle, canCall: true } as jest.ArgsType<{
      canCall: Boolean
      title: String
    }>)
    generator.next()
    generator.next({ dismissed: false, joined: false } as jest.ArgsType<{
      dismissed: Boolean
      joined: String
    }>)
    generator.next(true as jest.ArgsType<Boolean>)
    generator.next()
    expect(showBottomSheet).toHaveBeenCalledWith({
      bottomSheetType: BottomSheetEnum.CallStarted,
      roomId: callRoomId,
      title: roomTitle,
      bottomSheetBackdropPressBehaviour: 'none',
      bottomSheetEnablePanDownToClose: false,
    })
  })

  it('Test handleCallOnGoing saga with canCall disabled and with peer capability', () => {
    const callRoomId = 'testRoom1'
    const roomTitle = 'Test Room'
    const generator = handleCallOnGoing({ payload: { roomId: callRoomId } })
    generator.next()
    generator.next('testRoom' as jest.ArgsType<String>)
    generator.next({ title: roomTitle, canCall: false } as jest.ArgsType<{
      canCall: Boolean
      title: String
    }>)
    expect(generator.next().done).toBeTruthy()
  })

  it('Test if lobby bottom sheet storage data is removed after call ended', () => {
    const roomId = 'testRoom'
    const generator = handleCallEnded({ payload: { roomId: roomId } })
    generator.next()
    generator.next()
    expect(generator.next().value).toEqual(call(removeLobbyCallData, roomId))
    expect(generator.next().done).toBeTruthy()
  })

  it.skip('Test videoToggleSaga', () => {
    const generator = videoToggleSaga()
    generator.next()
    generator.next({ isVideoMuted: true } as jest.ArgsType<{
      isVideoMuted: Boolean
    }>)
    generator.next(2 as jest.ArgsType<Boolean>)
    generator.next([
      { deviceStaticId: FACE_CAM_DEVICE_STATIC_ID },
    ] as jest.ArgsType<Device[]>)
    expect(generator.next().value).toEqual(
      put(callVideoDeviceUpdate(FACE_CAM_DEVICE_STATIC_ID)),
    )
    expect(generator.next().value).toEqual(put(callVideoQualityUpdate(1)))
    expect(generator.next().value).toEqual(put(callVideoStreamToggle()))
    expect(generator.next().done).toBeTruthy()
  })

  it('Test if video is toggled to back camera', () => {
    const generator = onVideoCameraToggleSaga()
    generator.next()
    generator.next([{ deviceStaticId: '1|videoinput|2' }] as jest.ArgsType<
      Device[]
    >)
    expect(
      generator.next({
        deviceStaticId: FACE_CAM_DEVICE_STATIC_ID,
      } as jest.ArgsType<{ deviceStaticId: string }>).value,
    ).toEqual(put(callVideoDeviceUpdate('1|videoinput|2')))
    expect(generator.next().done).toBeTruthy()
  })
})
