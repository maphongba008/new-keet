import React from 'react'
import { render, screen } from '@testing-library/react-native'
import { BackHandler } from 'react-native'

import AppBottomSheet from 'component/AppBottomSheet/AppBottomSheet'
import { BottomSheetProvider } from 'component/AppBottomSheet/AppBottomSheet.Provider'

const BOTTOM_SHEET_TYPE = 10

jest.mock('../AppBottomSheet/AppBottomSheet.Provider', () => ({
  BottomSheetProvider: {
    bottomSheetContext: {
      bottomSheetIsTransparent: false,
      bottomSheetType: BOTTOM_SHEET_TYPE,
    },
  },
}))

jest.mock('react-native-safe-area-context', () => ({
  ...jest.requireActual('react-native-safe-area-context'),
  useSafeAreaInsets: jest.fn().mockReturnValue({
    bottom: 0,
  }),
}))

jest.mock('@gorhom/bottom-sheet', () => {
  const reactNative = jest.requireActual('react-native')
  const { View } = reactNative

  return {
    __esModule: true,
    default: View,
    BottomSheetModal: View,
    BottomSheetView: View,
    BottomSheetModalProvider: View,
    BottomSheetTextInput: View,
    useBottomSheetModal: () => ({
      present: () => {},
      dismiss: () => {},
    }),
  }
})

jest.mock('react-native-reanimated')
jest.mock('../AppBottomSheet/SheetComponents', () => {
  const SheetComponent = require('../__mocks__/BottomSheetComponent').default
  return {
    __esModule: true,
    default: {
      [BOTTOM_SHEET_TYPE]: SheetComponent,
    },
  }
})

describe('App bottom sheet works correctly', () => {
  it('should render sheet content when we provide valid bottomSheetType', async () => {
    render(<AppBottomSheet />)
    await screen.findAllByText('Test Component')
    expect(screen.toJSON()).toMatchSnapshot()
  })
  it('should have style set when isTransparent is false', () => {
    render(<AppBottomSheet />)
    expect(screen.getByTestId('bottom_sheet_view')).toHaveStyle({
      backgroundColor: '#151823',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      padding: 16,
    })
  })
  it('should have style set when isTransparent is true', () => {
    const bottomSheetContext = BottomSheetProvider.bottomSheetContext
    bottomSheetContext.bottomSheetIsTransparent = true
    render(<AppBottomSheet />)
    expect(screen.getByTestId('bottom_sheet_view')).toHaveStyle({
      paddingBottom: 16,
    })
    expect(screen.toJSON()).toMatchSnapshot()
  })
  // TODO: fix the workaround
  xit('should close sheet when user swipes back', () => {
    const indexRef = 2
    jest.spyOn(React, 'useRef').mockReturnValue({ current: indexRef })
    const addEventListenerMocked = jest.spyOn(
      BackHandler,
      'addEventListener',
    ) as jest.SpyInstance<any>
    render(<AppBottomSheet />)
    const backAction = addEventListenerMocked.mock.calls[0][1]
    const result = backAction()
    expect(result).toBeTruthy()
  })
})
