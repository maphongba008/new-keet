import React, { memo, useCallback, useEffect, useMemo } from 'react'

import { BottomSheetProvider, BottomSheetRef } from './AppBottomSheet.Provider'
import {
  closeBottomSheet,
  showBottomSheet,
  useAppBottomSheetStore,
} from './AppBottomSheet.Store'
import SheetComponents from './SheetComponents/index'
import { BottomSheetBase } from '../BottomSheetBase'

const AppBottomSheet = () => {
  const {
    bottomSheetType,
    bottomSheetIsTransparent,
    bottomSheetBackdropPressBehaviour,
    bottomSheetEnablePanDownToClose,
    bottomSheetOnDismissCallback,
    ...rest
  } = BottomSheetProvider.bottomSheetContext

  useEffect(() => {
    const timeout = setTimeout(() => BottomSheetRef?.current?.present())
    return () => clearTimeout(timeout)
  }, [])

  const onBottomSheetClose = useCallback(() => {
    if (bottomSheetOnDismissCallback) {
      bottomSheetOnDismissCallback()
    }
    closeBottomSheet()
  }, [bottomSheetOnDismissCallback])

  const renderComponent = useMemo(() => {
    const Component = (SheetComponents[bottomSheetType] as any) || null
    return <Component {...rest} />
  }, [bottomSheetType, rest])

  return (
    <BottomSheetBase
      sheetRef={BottomSheetRef}
      isTransparent={bottomSheetIsTransparent}
      backdropPressBehaviour={bottomSheetBackdropPressBehaviour ?? 'close'}
      enablePanDownToClose={bottomSheetEnablePanDownToClose ?? true}
      onClose={onBottomSheetClose}
    >
      {renderComponent}
    </BottomSheetBase>
  )
}

export default memo(AppBottomSheet)
export { showBottomSheet, closeBottomSheet, useAppBottomSheetStore }
