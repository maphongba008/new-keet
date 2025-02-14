import React, { useCallback, useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import { TextButtonType } from 'component/Button'
import GestureContainer from 'component/GestureContainer'
import { BackButton, NavBar, ScreenSystemBars } from 'component/NavBar'
import StatusScreen from 'component/StatusScreen'
import { createThemedStylesheet } from 'component/theme'
import s, { UI_SIZE_8, UI_SIZE_16 } from 'lib/commonStyles'
import { back, navigate, SCREEN_WALLET } from 'lib/navigation'
import { getPaymentBackend, useWalletStore } from 'lib/wallet'

import { useStrings } from 'i18n/strings'

import NetworkMode from './NetworkMode'
import NetworkSetting from './NetworkSetting'
import NetworkType from './NetworkType'

export interface WalletNetworkConfigI {
  chainNetwork: string
  networkMode: string
  onSelectItem: (value: any) => void
  currentNetwork: string
  onPressContinue: () => void
  onNetworkConnect?: (opt: any) => void
}

function CustomServerSetup() {
  const styles = getStyles()
  const {
    wallet: { network: strings },
  } = useStrings()

  const { setWallet, networkData, setNetworkData, resetNetworkData } =
    useWalletStore() as any

  const [currentStep, setCurrentStep] = useState(0)
  const [chainNetwork, setChainNetwork] = useState<any>(null)
  const [networkMode, setNetworkMode] = useState<any>(null)

  const selectedNetwork = useMemo(
    () =>
      getPaymentBackend()
        .getChainNetworks()
        .find((e) => e.ccy === chainNetwork),
    [chainNetwork],
  )

  const title = useMemo(
    () =>
      currentStep < 1
        ? strings.custom
        : currentStep < 2
          ? strings.networkTitle.replace('$0', selectedNetwork?.label!)
          : strings.serverTitle.replace('$0', networkMode),
    [
      networkMode,
      currentStep,
      selectedNetwork?.label,
      strings.custom,
      strings.networkTitle,
      strings.serverTitle,
    ],
  )

  const handleBack = useCallback(() => {
    setCurrentStep((prevState) => {
      if (!prevState) back()
      return prevState - 1
    })
  }, [])

  const onNextStep = useCallback(() => {
    setCurrentStep((prevState) => prevState + 1)
  }, [])

  const onNetworkConnect = useCallback(
    ({ indexerWs, networkHost, port }: any) => {
      const { success, error } = getPaymentBackend().connectNetwork({
        port,
        indexerWs,
        host: networkHost,
        mode: networkMode,
        network: chainNetwork,
      })
      setNetworkData(success, error)
    },
    [chainNetwork, networkMode, setNetworkData],
  )

  const onFinish = useCallback(() => {
    if (!networkData?.success && !!networkData?.error) {
      resetNetworkData()
      return
    }
    setWallet()
    navigate(SCREEN_WALLET)
  }, [networkData?.error, networkData?.success, resetNetworkData, setWallet])

  if (networkData) {
    const { success: isSetupCompleted, error: errorMsg } = networkData
    return (
      <StatusScreen
        title={
          !isSetupCompleted ? strings.connectionFailed : strings.successful
        }
        subTitle={!isSetupCompleted && errorMsg}
        btnLabel={!isSetupCompleted ? strings.takeMeBack : null}
        btnType={
          !isSetupCompleted ? TextButtonType.danger : TextButtonType.primary
        }
        onFinish={onFinish}
      />
    )
  }

  return (
    <GestureContainer>
      <ScreenSystemBars />
      <NavBar
        title={title}
        right={null}
        left={<BackButton overrideOnPress={handleBack} />}
      />
      <View style={[s.container, styles.root]}>
        {currentStep < 1 ? (
          <NetworkType
            chainNetwork={chainNetwork}
            onSelectItem={setChainNetwork}
            onPressContinue={onNextStep}
          />
        ) : currentStep < 2 ? (
          <NetworkMode
            networkMode={networkMode}
            onSelectItem={setNetworkMode}
            onPressContinue={onNextStep}
            currentNetwork={selectedNetwork?.label!}
          />
        ) : (
          <NetworkSetting
            chainNetwork={chainNetwork}
            currentNetwork={selectedNetwork?.label!}
            onNetworkConnect={onNetworkConnect}
          />
        )}
      </View>
    </GestureContainer>
  )
}

const getStyles = createThemedStylesheet(() => {
  const styles = StyleSheet.create({
    root: {
      marginTop: UI_SIZE_8,
      paddingHorizontal: UI_SIZE_16,
    },
  })
  return styles
})

export default CustomServerSetup
