import { Keyboard } from 'react-native'
import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import _debounce from 'lodash/debounce'

import {
  BACK_DEBOUNCE_DELAY,
  BACK_DEBOUNCE_OPTIONS,
  BOTTOM_SHEET_ANIMATION_DURATION,
  BOTTOM_SHEET_ANIMATION_REPLACE_TIMEOUT,
} from 'lib/constants'
import { doVibrateSuccess } from 'lib/haptics'
import { wait } from 'lib/wait'

import {
  AppSheetType,
  BottomSheetProvider,
  BottomSheetRef,
} from './AppBottomSheet.Provider'
import BottomSheetEnum from './SheetComponents/BottomSheetEnum'
import { OptionSheetOption } from './SheetComponents/components/OptionsButtonList'

interface AppBottomSheetState {
  showBottomSheet: boolean
  sheetType: number
  setSheet: (value: boolean) => void
  setSheetType: (type: number) => void
}

export const useAppBottomSheetStore = create<AppBottomSheetState>((set) => ({
  showBottomSheet: false,
  sheetType: 0,
  setSheetType: (sheetType: number) => {
    set({ sheetType })
  },
  setSheet: (value: boolean) => {
    set({ showBottomSheet: value })
  },
}))

export const useAppBottomSheetState = () =>
  useAppBottomSheetStore(useShallow((state) => state))

// Note: if you show a bottom sheet right after hide another one, make sure to wait for the animation to finish
// using setTimeout(() => {}, BOTTOM_SHEET_ANIMATION_DURATION)
export const showBottomSheet = _debounce(
  async (data: AppSheetType) => {
    doVibrateSuccess()
    Keyboard.dismiss()
    if (useAppBottomSheetStore.getState().showBottomSheet) {
      await closeBottomSheetAsync()
      await wait(BOTTOM_SHEET_ANIMATION_REPLACE_TIMEOUT)
    }

    const { bottomSheetType, bottomSheetOnDismissCallback, ...rest } = data
    // @ts-ignore
    BottomSheetProvider.bottomSheetContext = {
      bottomSheetType,
      bottomSheetOnDismissCallback,
      ...rest,
    }
    const { setSheet, setSheetType } = useAppBottomSheetStore.getState()
    setSheet(true)
    setSheetType(bottomSheetType)
  },
  BACK_DEBOUNCE_DELAY,
  BACK_DEBOUNCE_OPTIONS,
)

export const showOptionsSheet = async ({
  options,
}: {
  options: OptionSheetOption[]
}) => {
  showBottomSheet({
    bottomSheetType: BottomSheetEnum.OptionsSheet,
    options,
    bottomSheetIsTransparent: true,
  })
}

export const closeBottomSheet = () => {
  BottomSheetRef?.current?.close({
    duration: BOTTOM_SHEET_ANIMATION_DURATION,
  })
  useAppBottomSheetStore.getState().setSheet(false)
}

export const closeBottomSheetAsync = async () => {
  closeBottomSheet()
  await wait(
    BOTTOM_SHEET_ANIMATION_DURATION + BOTTOM_SHEET_ANIMATION_REPLACE_TIMEOUT,
  )
}
