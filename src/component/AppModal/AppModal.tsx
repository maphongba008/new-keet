import React, { memo, useCallback, useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'

import { closeAppModal, getAppModalVisibleData } from 'reducers/application'

import { createThemedStylesheet } from 'component/theme'
import s from 'lib/commonStyles'
import { useFocusedBackHandler } from 'lib/hooks/useBackHandler'

import ModalComponent from './ModalComponents/index'
import { IDENTITY, IDENTITY_INTRO, ON_BOARDING, SETUP_NAME } from './types'

const AppModal = () => {
  const styles = getStyles()
  const dispatch = useDispatch()
  const modalData = useSelector(getAppModalVisibleData)

  const renderComponent = useMemo(() => {
    if (!modalData) return null
    const Component = (ModalComponent as any)[modalData?.modalType] || null
    return Component ? <Component {...modalData.config} /> : null
  }, [modalData])

  const handleClose = useCallback(() => {
    if (
      modalData?.modalType === ON_BOARDING ||
      modalData?.modalType === IDENTITY_INTRO ||
      modalData?.modalType === IDENTITY ||
      modalData?.modalType === SETUP_NAME
    ) {
      // user must setup ID & setup name, do not allow them to close the modal
      return true
    }
    dispatch(closeAppModal())
    return false
  }, [modalData?.modalType, dispatch])

  useFocusedBackHandler(handleClose)

  const WrapperComponent = modalData?.config?.statusBarTranslucent
    ? View
    : SafeAreaView

  return (
    <WrapperComponent style={[s.container, styles.container]}>
      {renderComponent}
    </WrapperComponent>
  )
}

const getStyles = createThemedStylesheet((theme) => {
  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.background.bg_2,
    },
  })
  return styles
})

export default memo(AppModal)
