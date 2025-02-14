import { fireEvent, screen } from '@testing-library/react-native'

import BottomSheetEnum from 'component/AppBottomSheet/SheetComponents/BottomSheetEnum'
import { APPIUM_IDs } from 'lib/appium'
import { renderWithProviders } from 'lib/testUtils'

import * as SheetFn from '../../../component/AppBottomSheet/AppBottomSheet.Store'
import RoomActionsBtn from '../RoomActionsBtn'

jest.spyOn(SheetFn, 'showBottomSheet').mockReturnValue(undefined)

describe('RoomListFilter', () => {
  test('render correctly', async () => {
    const element = <RoomActionsBtn />
    const result = renderWithProviders(element)
    expect(result.toJSON()).toMatchSnapshot()
    // check if showBottomSheet was called when button Add is pressed
    const btn = await screen.findByTestId(APPIUM_IDs.lobby_btn_add_room)
    fireEvent.press(btn)
    expect(SheetFn.showBottomSheet).toHaveBeenCalledWith({
      bottomSheetType: BottomSheetEnum.RoomActionSheet,
    })
  })
})
